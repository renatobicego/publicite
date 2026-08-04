import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { ValuacionServiceInterface } from '../../domain/service/valuacion.service.interface';
import { ValuacionRepositoryInterface } from '../../domain/repository/valuacion.repository.interface';
import { ValuacionAIServiceInterface } from '../../domain/service/valuacion.ai.service.interface';
import { ChatbotTokenServiceInterface } from 'src/contexts/module_user/chatbot/domain/service/chatbot.token.service.interface';
import { PostRepositoryInterface } from 'src/contexts/module_post/post/domain/repository/post.repository.interface';
import { TokenGateResult } from 'src/contexts/module_user/chatbot/domain/entity/chatbot.token.types';
import { buildModeContext } from 'src/contexts/module_user/chatbot/domain/service/cubito-modes';
import {
  getMaxValuacionImages,
  sanitizeImageUrls,
} from 'src/contexts/module_shared/ai/ai.config';
import { MyLoggerService } from 'src/contexts/module_shared/logger/logger.service';

import {
  StartValuacionRequest,
  ValuacionMessageRequest,
} from '../dto/HTTP-REQUEST/valuacion.requests';
import {
  ValuacionListResponse,
  ValuacionMessageResponse,
  ValuacionResponse,
  ValuacionToPostDraftResponse,
} from '../dto/HTTP-RESPONSE/valuacion.response';
import {
  ValuacionBriefField,
  ValuacionStatus,
  VALUACION_BRIEF_FIELDS,
} from '../../domain/entity/enum/valuacion.enums';
import {
  ValuacionBriefMessage,
  ValuacionEntity,
} from '../../domain/entity/valuacion.entity';
import {
  capConfidenceByLayer,
  computeCompletion,
  computeFinalScore,
} from '../../domain/service/valuacion.scoring';

const SALUDO_INICIAL =
  '¡Hola! ¡Comencemos! Contame qué querés valuar y te voy a hacer algunas preguntas para armar el informe 🙂';

function getMaxValuacionesPerDay(): number {
  const raw = Number(process.env.VALUACION_MAX_PER_DAY);
  return Number.isFinite(raw) && raw > 0 ? Math.floor(raw) : 10;
}

@Injectable()
export class ValuacionService implements ValuacionServiceInterface {
  constructor(
    @Inject('ValuacionRepositoryInterface')
    private readonly valuacionRepository: ValuacionRepositoryInterface,
    @Inject('ValuacionAIServiceInterface')
    private readonly valuacionAIService: ValuacionAIServiceInterface,
    @Inject('ChatbotTokenServiceInterface')
    private readonly tokenService: ChatbotTokenServiceInterface,
    @Inject('PostRepositoryInterface')
    private readonly postRepository: PostRepositoryInterface,
    private readonly logger: MyLoggerService,
  ) {}

  async startValuacion(
    userId: string,
    request: StartValuacionRequest,
  ): Promise<ValuacionMessageResponse> {
    await this.assertDailyQuota(userId);

    const imageUrls = sanitizeImageUrls(
      request.imageUrls,
      getMaxValuacionImages(),
    );

    const now = new Date();
    const created = await this.valuacionRepository.create({
      userId,
      sessionId: request.sessionId,
      category: request.category,
      status: ValuacionStatus.draft,
      mode: request.mode,
      layer: 1,
      completionPercent: 0,
      confidencePercent: 0,
      coveredFields: [],
      briefMessages: [],
      briefAnswers: [],
      images: imageUrls.map((url) => ({ url, uploadedAt: now })),
      dataSources: [],
      versions: [],
    });

    // Sin descripción inicial no hay nada que analizar: se saluda y se espera al
    // usuario. Así no se gasta una llamada a OpenAI sólo para decir "hola".
    if (!request.description?.trim() && imageUrls.length === 0) {
      const withGreeting = await this.appendMessages(created._id!, [
        { role: 'assistant', content: SALUDO_INICIAL, timestamp: now },
      ]);
      return {
        reply: SALUDO_INICIAL,
        briefComplete: false,
        valuacion: this.toResponse(withGreeting ?? created),
      };
    }

    return this.runBriefTurn(
      userId,
      created,
      request.description?.trim() ||
        'Adjunté imágenes de lo que quiero valuar. Analizalas y arrancá el brief.',
      imageUrls,
    );
  }

  async sendMessage(
    userId: string,
    request: ValuacionMessageRequest,
  ): Promise<ValuacionMessageResponse> {
    const valuacion = await this.loadOwned(userId, request.valuacionId);
    this.assertEditable(valuacion);

    const newImages = sanitizeImageUrls(
      request.imageUrls,
      getMaxValuacionImages(),
    );

    let current = valuacion;
    if (newImages.length > 0) {
      const now = new Date();
      const merged = this.mergeImages(valuacion, newImages, now);
      current =
        (await this.valuacionRepository.update(valuacion._id!, {
          $set: { images: merged },
        })) ?? valuacion;
    }

    const allImages = current.images.map((image) => image.url);
    return this.runBriefTurn(userId, current, request.message, allImages);
  }

  async skipBriefQuestion(
    userId: string,
    valuacionId: string,
  ): Promise<ValuacionMessageResponse> {
    const valuacion = await this.loadOwned(userId, valuacionId);
    this.assertEditable(valuacion);

    // Omitir no cubre el eje: baja la capa alcanzable, que es justo lo que pide
    // el AC08. Se manda como un mensaje más para que Cubito siga la conversación.
    return this.runBriefTurn(
      userId,
      valuacion,
      'Prefiero omitir esa pregunta, pasemos a la siguiente.',
      valuacion.images.map((image) => image.url),
    );
  }

  async generateResult(
    userId: string,
    valuacionId: string,
  ): Promise<ValuacionResponse> {
    const valuacion = await this.loadOwned(userId, valuacionId);
    if (valuacion.status === ValuacionStatus.archived) {
      throw new BadRequestException('La valuación está archivada');
    }

    const gate = await this.tokenService.resolveAndCheck(userId, undefined);
    if (!gate.allowed) {
      throw new BadRequestException(this.tokenService.buildLimitMessage(gate));
    }

    await this.valuacionRepository.update(valuacionId, {
      $set: { status: ValuacionStatus.processing },
    });

    try {
      const imageUrls = valuacion.images.map((image) => image.url);
      const result = await this.valuacionAIService.generateResult({
        category: valuacion.category,
        modeContext: buildModeContext({ mode: valuacion.mode }),
        history: valuacion.briefMessages,
        imageUrls,
      });

      // La capa y la completitud son del backend; la confianza que declaró la IA
      // se acota al techo de la capa alcanzada.
      const completion = computeCompletion(
        valuacion.coveredFields,
        valuacion.images.length,
      );
      const confidencePercent = capConfidenceByLayer(
        result.confidencePercent,
        completion.layer,
      );
      const finalScore = computeFinalScore(
        result.photoAnalysis,
        result.descriptiveAnalysis,
      );

      const tokenStatus = await this.tokenService.chargeAndBuildStatus(
        gate,
        result.usage,
        {
          sessionId: valuacion.sessionId,
          kind: 'valuacion',
          model: result.model,
        },
      );

      const changes: Record<string, any> = {
        $set: {
          status: ValuacionStatus.completed,
          layer: completion.layer,
          completionPercent: completion.completionPercent,
          confidencePercent,
          photoAnalysis: result.photoAnalysis,
          descriptiveAnalysis: result.descriptiveAnalysis,
          estimatedValues: result.estimatedValues,
          finalScore,
          dataSources: result.dataSources,
        },
      };

      // Si ya había un resultado, se archiva como versión antes de pisarlo.
      if (valuacion.finalScore != null || valuacion.estimatedValues) {
        changes.$push = {
          versions: {
            generatedAt: new Date(),
            layer: valuacion.layer,
            completionPercent: valuacion.completionPercent,
            confidencePercent: valuacion.confidencePercent,
            finalScore: valuacion.finalScore,
            photoAnalysis: valuacion.photoAnalysis,
            descriptiveAnalysis: valuacion.descriptiveAnalysis,
            estimatedValues: valuacion.estimatedValues,
          },
        };
      }

      const updated = await this.valuacionRepository.update(valuacionId, changes);
      if (!updated) throw new NotFoundException('Valuación no encontrada');

      return this.toResponse(updated, tokenStatus);
    } catch (error: any) {
      // No dejar la valuación colgada en 'processing' si la IA falló.
      await this.valuacionRepository.update(valuacionId, {
        $set: { status: valuacion.status },
      });
      this.logger.error(
        `Error generando resultado de valuación ${valuacionId}: ${error.message}`,
      );
      throw error;
    }
  }

  async saveResult(
    userId: string,
    valuacionId: string,
  ): Promise<ValuacionResponse> {
    const valuacion = await this.loadOwned(userId, valuacionId);
    if (valuacion.status !== ValuacionStatus.completed) {
      throw new BadRequestException(
        'Sólo se pueden guardar valuaciones con un resultado generado',
      );
    }
    const updated = await this.valuacionRepository.update(valuacionId, {
      $set: { status: ValuacionStatus.saved },
    });
    return this.toResponse(updated!);
  }

  async restoreToBoard(
    userId: string,
    valuacionId: string,
  ): Promise<ValuacionResponse> {
    const valuacion = await this.loadOwned(userId, valuacionId);
    if (valuacion.status !== ValuacionStatus.saved) {
      throw new BadRequestException(
        'Sólo se pueden devolver al tablero las valuaciones guardadas',
      );
    }
    const updated = await this.valuacionRepository.update(valuacionId, {
      $set: { status: ValuacionStatus.completed },
    });
    return this.toResponse(updated!);
  }

  async linkToPost(
    userId: string,
    valuacionId: string,
    postId: string,
  ): Promise<ValuacionResponse> {
    await this.loadOwned(userId, valuacionId);

    // No alcanza con ser dueño de la valuación: sin este chequeo, cualquiera
    // podría colgar su valuación del anuncio de otro y aparecer en su página.
    const isAuthor = await this.postRepository.isPostAuthor(postId, userId);
    if (!isAuthor) {
      throw new ForbiddenException(
        'Sólo podés asociar una valuación a un anuncio propio',
      );
    }

    const updated = await this.valuacionRepository.update(valuacionId, {
      $set: { postId },
    });
    if (!updated) throw new NotFoundException('Valuación no encontrada');
    return this.toResponse(updated);
  }

  async deleteValuacion(userId: string, valuacionId: string): Promise<boolean> {
    await this.loadOwned(userId, valuacionId);
    return this.valuacionRepository.softDelete(valuacionId);
  }

  async getUserValuaciones(
    userId: string,
    limit: number,
    page: number,
  ): Promise<ValuacionListResponse> {
    const result = await this.valuacionRepository.findByUser(userId, limit, page);
    return {
      valuaciones: result.valuaciones.map((valuacion) =>
        this.toResponse(valuacion),
      ),
      total: result.total,
      hasMore: result.hasMore,
    };
  }

  async getValuacion(
    userId: string,
    valuacionId: string,
  ): Promise<ValuacionResponse> {
    const valuacion = await this.loadOwned(userId, valuacionId);
    return this.toResponse(valuacion);
  }

  async getValuacionByPost(postId: string): Promise<ValuacionResponse | null> {
    const valuacion = await this.valuacionRepository.findByPostId(postId);
    return valuacion ? this.toResponse(valuacion) : null;
  }

  async buildPostDraft(
    userId: string,
    valuacionId: string,
  ): Promise<ValuacionToPostDraftResponse> {
    const valuacion = await this.loadOwned(userId, valuacionId);
    if (!valuacion.estimatedValues && !valuacion.photoAnalysis) {
      throw new BadRequestException(
        'Generá el resultado de la valuación antes de crear el anuncio',
      );
    }

    const photo = valuacion.photoAnalysis;
    const title =
      [photo?.brand, photo?.model].filter(Boolean).join(' ') ||
      photo?.description?.slice(0, 60) ||
      `Valuación ${valuacion.category}`;

    const descriptionParts = [
      photo?.description,
      valuacion.descriptiveAnalysis?.summary,
      photo?.condition ? `Estado: ${photo.condition}.` : null,
      photo?.damages?.length ? `Detalles: ${photo.damages.join(', ')}.` : null,
    ].filter(Boolean);

    return {
      title,
      description: descriptionParts.join('\n\n'),
      suggestedPrice: valuacion.estimatedValues?.mercado ?? null,
      imageUrls: valuacion.images.map((image) => image.url),
      brand: photo?.brand ?? null,
      modelType: photo?.model ?? null,
      condition: photo?.condition ?? null,
      valuacionId: valuacion._id!,
    };
  }

  // ─────────────────────────── internos ───────────────────────────

  /**
   * Ejecuta un turno del brief: cobra tokens, llama a la IA, acumula los ejes
   * cubiertos y recalcula capa y completitud.
   */
  private async runBriefTurn(
    userId: string,
    valuacion: ValuacionEntity,
    userMessage: string,
    imageUrls: string[],
  ): Promise<ValuacionMessageResponse> {
    const gate = await this.tokenService.resolveAndCheck(
      userId,
      valuacion.sessionId,
    );
    if (!gate.allowed) {
      return this.buildLimitResponse(valuacion, gate);
    }

    const turn = await this.valuacionAIService.runBriefTurn({
      category: valuacion.category,
      modeContext: buildModeContext({ mode: valuacion.mode }),
      coveredFields: valuacion.coveredFields,
      history: valuacion.briefMessages,
      userMessage,
      imageUrls,
    });

    const coveredFields = this.mergeCoveredFields(
      valuacion.coveredFields,
      turn.coveredFields,
    );
    const completion = computeCompletion(coveredFields, valuacion.images.length);

    const tokenStatus = await this.tokenService.chargeAndBuildStatus(
      gate,
      turn.usage,
      {
        sessionId: valuacion.sessionId,
        kind: 'valuacion',
        model: turn.model,
      },
    );

    const now = new Date();
    const updated = await this.valuacionRepository.update(valuacion._id!, {
      $set: {
        coveredFields,
        layer: completion.layer,
        completionPercent: completion.completionPercent,
      },
      $push: {
        briefMessages: {
          $each: [
            { role: 'user', content: userMessage, timestamp: now },
            { role: 'assistant', content: turn.reply, timestamp: now },
          ],
        },
      },
    });

    return {
      reply: turn.reply,
      briefComplete: turn.briefComplete,
      valuacion: this.toResponse(updated ?? valuacion, tokenStatus),
    };
  }

  private async appendMessages(
    valuacionId: string,
    messages: ValuacionBriefMessage[],
  ): Promise<ValuacionEntity | null> {
    return this.valuacionRepository.update(valuacionId, {
      $push: { briefMessages: { $each: messages } },
    });
  }

  /** Une los ejes ya cubiertos con los que reportó la IA, descartando inventados. */
  private mergeCoveredFields(
    current: ValuacionBriefField[],
    incoming: string[],
  ): ValuacionBriefField[] {
    const merged = new Set<ValuacionBriefField>(current ?? []);
    for (const field of incoming ?? []) {
      const normalized = field?.trim() as ValuacionBriefField;
      if (VALUACION_BRIEF_FIELDS.includes(normalized)) {
        merged.add(normalized);
      }
    }
    return Array.from(merged);
  }

  private mergeImages(
    valuacion: ValuacionEntity,
    newUrls: string[],
    now: Date,
  ) {
    const existing = new Set(valuacion.images.map((image) => image.url));
    const additions = newUrls
      .filter((url) => !existing.has(url))
      .map((url) => ({ url, uploadedAt: now }));
    return [...valuacion.images, ...additions].slice(
      0,
      getMaxValuacionImages(),
    );
  }

  private async loadOwned(
    userId: string,
    valuacionId: string,
  ): Promise<ValuacionEntity> {
    const valuacion = await this.valuacionRepository.findById(valuacionId);
    if (!valuacion) throw new NotFoundException('Valuación no encontrada');
    if (valuacion.userId !== userId) {
      throw new ForbiddenException('La valuación pertenece a otro usuario');
    }
    return valuacion;
  }

  private assertEditable(valuacion: ValuacionEntity): void {
    if (
      valuacion.status === ValuacionStatus.archived ||
      valuacion.status === ValuacionStatus.processing
    ) {
      throw new BadRequestException(
        'La valuación no admite cambios en este estado',
      );
    }
  }

  private async assertDailyQuota(userId: string): Promise<void> {
    const since = new Date();
    since.setUTCHours(0, 0, 0, 0);
    const count = await this.valuacionRepository.countCreatedSince(userId, since);
    const max = getMaxValuacionesPerDay();
    if (count >= max) {
      throw new BadRequestException(
        `Alcanzaste el máximo de ${max} valuaciones por día. Probá de nuevo mañana 🙂`,
      );
    }
  }

  private buildLimitResponse(
    valuacion: ValuacionEntity,
    gate: TokenGateResult,
  ): ValuacionMessageResponse {
    return {
      reply: this.tokenService.buildLimitMessage(gate),
      briefComplete: false,
      limitReached: true,
      valuacion: this.toResponse(
        valuacion,
        this.tokenService.buildStatusFromGate(gate),
      ),
    };
  }

  private toResponse(
    valuacion: ValuacionEntity,
    tokenStatus?: any,
  ): ValuacionResponse {
    return {
      id: valuacion._id!,
      userId: valuacion.userId,
      sessionId: valuacion.sessionId,
      postId: valuacion.postId ?? null,
      category: valuacion.category,
      status: valuacion.status,
      mode: valuacion.mode,
      layer: valuacion.layer,
      completionPercent: valuacion.completionPercent,
      confidencePercent: valuacion.confidencePercent,
      coveredFields: valuacion.coveredFields ?? [],
      briefMessages: valuacion.briefMessages ?? [],
      images: valuacion.images ?? [],
      photoAnalysis: (valuacion.photoAnalysis as any) ?? null,
      descriptiveAnalysis: (valuacion.descriptiveAnalysis as any) ?? null,
      estimatedValues: (valuacion.estimatedValues as any) ?? null,
      finalScore: valuacion.finalScore ?? null,
      dataSources: valuacion.dataSources ?? [],
      versionsCount: valuacion.versions?.length ?? 0,
      createdAt: valuacion.createdAt,
      updatedAt: valuacion.updatedAt,
      tokenStatus,
    };
  }
}
