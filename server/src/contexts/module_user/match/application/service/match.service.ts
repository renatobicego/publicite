import { BadRequestException, Inject, Injectable } from '@nestjs/common';

import { PostRepositoryInterface } from 'src/contexts/module_post/post/domain/repository/post.repository.interface';
import { removeAccents_removeEmojisAndToLowerCase } from 'src/contexts/module_post/post/domain/utils/normalice.data';
import { ChatbotTokenServiceInterface } from 'src/contexts/module_user/chatbot/domain/service/chatbot.token.service.interface';
import {
  AiUsage,
  TokenGateResult,
} from 'src/contexts/module_user/chatbot/domain/entity/chatbot.token.types';
import { ChatbotTokenStatusResponse } from 'src/contexts/module_user/chatbot/application/dto/HTTP-RESPONSE/chatbot.token.response';
import { buildModeContext } from 'src/contexts/module_user/chatbot/domain/service/cubito-modes';
import {
  getMaxMatchImages,
  sanitizeImageUrls,
} from 'src/contexts/module_shared/ai/ai.config';
import { MyLoggerService } from 'src/contexts/module_shared/logger/logger.service';

import { MatchAIServiceInterface } from '../../domain/service/match.ai.service.interface';
import { MatchServiceInterface } from '../../domain/service/match.service.interface';
import { MatchResponse, SearchMatchRequest } from '../dto/match.dto';

const CANDIDATE_LIMIT = 20;
const MIN_RELEVANCE = 30;

@Injectable()
export class MatchService implements MatchServiceInterface {
  constructor(
    @Inject('PostRepositoryInterface')
    private readonly postRepository: PostRepositoryInterface,
    @Inject('MatchAIServiceInterface')
    private readonly matchAIService: MatchAIServiceInterface,
    @Inject('ChatbotTokenServiceInterface')
    private readonly tokenService: ChatbotTokenServiceInterface,
    private readonly logger: MyLoggerService,
  ) {}

  async searchMatch(
    userId: string | undefined,
    request: SearchMatchRequest,
  ): Promise<MatchResponse> {
    const imageUrls = sanitizeImageUrls(request.imageUrls, getMaxMatchImages());

    // Construir el texto de entrada: libre, o derivado del anuncio de referencia.
    const inputText = await this.buildInputText(request);
    if (!inputText && imageUrls.length === 0) {
      throw new BadRequestException(
        'Contame qué estás buscando, o subí una imagen o un anuncio de referencia',
      );
    }

    const gate = await this.tokenService.resolveAndCheck(
      userId,
      request.sessionId,
    );
    if (!gate.allowed) {
      return {
        matches: [],
        candidatesEvaluated: 0,
        limitReached: true,
        message: this.tokenService.buildLimitMessage(gate),
        tokenStatus: this.tokenService.buildStatusFromGate(gate),
      };
    }

    const modeContext = buildModeContext({ mode: request.mode });

    // Paso 1 — la IA traduce el input a criterios de búsqueda.
    const criteria = await this.matchAIService.extractCriteria({
      text: inputText,
      imageUrls,
      modeContext,
    });

    // Paso 2 — búsqueda en Mongo. Las keywords se normalizan igual que
    // searchTitle/searchDescription (sin acentos, sin emojis, minúsculas), o el
    // regex no matchearía nunca contra los campos de búsqueda.
    const keywords = criteria.keywords
      .map((keyword) => removeAccents_removeEmojisAndToLowerCase(keyword))
      .filter(Boolean);

    const categoryIds = criteria.categories.length
      ? await this.postRepository.findCategoryIdsByLabels(criteria.categories)
      : [];

    const candidates = await this.postRepository.findCandidatesForMatch({
      keywords,
      categoryIds,
      priceMin: criteria.priceMin,
      priceMax: criteria.priceMax,
      postType: criteria.postType,
      excludeAuthorId: userId,
      limit: CANDIDATE_LIMIT,
    });

    const interpretation = criteria.description || inputText || '';

    // Sin candidatos no tiene sentido gastar la llamada de ranking.
    if (candidates.length === 0) {
      const tokenStatus = await this.chargeAll(
        gate,
        request.sessionId,
        [{ usage: criteria.usage, model: criteria.model }],
      );
      return {
        matches: [],
        interpretation,
        candidatesEvaluated: 0,
        message:
          'No encontré anuncios similares por ahora. Probá con otras palabras o ampliá la descripción 🙂',
        tokenStatus,
      };
    }

    // Paso 3 — ranking con explicación.
    const ranking = await this.matchAIService.rankMatches({
      interpretation,
      candidates,
      imageUrls,
    });

    const byId = new Map(candidates.map((candidate) => [candidate.postId, candidate]));
    const matches = ranking.matches
      .filter((match) => match.relevanceScore >= MIN_RELEVANCE)
      .map((match) => {
        const candidate = byId.get(match.postId)!;
        return {
          postId: candidate.postId,
          title: candidate.title,
          description: candidate.description,
          price: candidate.price,
          imageUrl: candidate.imageUrl,
          postType: candidate.postType,
          relevanceScore: match.relevanceScore,
          matchReason: match.matchReason,
        };
      });

    const tokenStatus = await this.chargeAll(gate, request.sessionId, [
      { usage: criteria.usage, model: criteria.model },
      { usage: ranking.usage, model: ranking.model },
    ]);

    return {
      matches,
      interpretation,
      candidatesEvaluated: candidates.length,
      message: matches.length
        ? undefined
        : 'Encontré algunos anuncios pero ninguno lo suficientemente parecido. Probá describiéndolo con otras palabras 🙂',
      tokenStatus,
    };
  }

  /** Texto de entrada: el que escribió el usuario, o el del anuncio de referencia. */
  private async buildInputText(
    request: SearchMatchRequest,
  ): Promise<string | undefined> {
    const parts: string[] = [];

    if (request.text?.trim()) parts.push(request.text.trim());

    if (request.postId) {
      const post = await this.postRepository.findPostSummaryForMatch(
        request.postId,
      );
      if (!post) {
        throw new BadRequestException('El anuncio de referencia no existe');
      }
      parts.push(
        `Anuncio de referencia: "${post.title}". ${post.description ?? ''} ` +
          `Categorías: ${post.categoryLabels.join(', ') || 'sin categoría'}. ` +
          `Precio: ${post.price}.`,
      );
    }

    return parts.length ? parts.join('\n\n') : undefined;
  }

  /**
   * Cobra todas las llamadas a OpenAI de esta búsqueda y devuelve el estado
   * final de tokens.
   *
   * Se cobra llamada por llamada (y no sumando los usages) porque el
   * multiplicador de costo depende del modelo: extracción y ranking pueden
   * correr en modelos distintos según haya imágenes o no.
   */
  private async chargeAll(
    gate: TokenGateResult,
    sessionId: string | undefined,
    calls: { usage?: AiUsage; model: string }[],
  ): Promise<ChatbotTokenStatusResponse> {
    let chargedRealTokens = 0;

    for (const call of calls) {
      if (!call.usage) continue;
      chargedRealTokens += await this.tokenService.recordUsage(gate, call.usage, {
        sessionId,
        channel: 'web',
        kind: 'match',
        model: call.model,
      });
    }

    const usedAfter = gate.usedRealTokens + chargedRealTokens;
    return this.tokenService.buildStatusFromGate({
      ...gate,
      usedRealTokens: usedAfter,
      remainingRealTokens: Math.max(
        0,
        gate.consumer.allowanceRealTokens - usedAfter,
      ),
    });
  }
}
