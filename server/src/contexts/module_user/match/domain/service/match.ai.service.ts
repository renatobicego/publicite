import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';

import {
  AI_TEXT_MODEL,
  getVisionModel,
  parseJsonFromModel,
} from 'src/contexts/module_shared/ai/ai.config';
import { AiUsage } from 'src/contexts/module_user/chatbot/domain/entity/chatbot.token.types';
import { MatchCandidate } from 'src/contexts/module_post/post/domain/repository/post.repository.interface';
import {
  MATCH_EXTRACTION_PROMPT,
  MATCH_RANKING_PROMPT,
} from './match.prompts';
import {
  MatchAIServiceInterface,
  MatchCriteriaResult,
  MatchRankingResult,
  RankedMatch,
} from './match.ai.service.interface';

/** Cuántos candidatos se mandan al ranking (más = más tokens de input). */
const MAX_CANDIDATES_TO_RANK = 20;

@Injectable()
export class MatchAIService implements MatchAIServiceInterface {
  private openai: OpenAI;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('OPENAI_API_KEY');
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY is not defined in environment variables');
    }
    this.openai = new OpenAI({ apiKey });
  }

  async extractCriteria(params: {
    text?: string;
    imageUrls: string[];
    modeContext?: string;
  }): Promise<MatchCriteriaResult> {
    const hasImages = params.imageUrls.length > 0;
    const model = hasImages ? getVisionModel() : AI_TEXT_MODEL;

    const userContent: any = hasImages
      ? [
          {
            type: 'text',
            text: params.text || 'Buscá anuncios similares a lo que muestran estas imágenes.',
          },
          ...params.imageUrls.map((url) => ({
            type: 'image_url' as const,
            image_url: { url, detail: 'low' as const },
          })),
        ]
      : params.text || '';

    const completion = await this.openai.chat.completions.create({
      model,
      messages: [
        {
          role: 'system',
          content: params.modeContext
            ? `${MATCH_EXTRACTION_PROMPT}\n\nCONTEXTO ADICIONAL:\n${params.modeContext}`
            : MATCH_EXTRACTION_PROMPT,
        },
        { role: 'user', content: userContent },
      ],
      temperature: 0.3,
      max_tokens: 500,
      response_format: { type: 'json_object' },
    });

    const raw = parseJsonFromModel<any>(completion.choices[0]?.message?.content);

    return {
      keywords: this.asStringArray(raw?.keywords).slice(0, 12),
      categories: this.asStringArray(raw?.categories).slice(0, 6),
      priceMin: this.asNullableNumber(raw?.priceRange?.min),
      priceMax: this.asNullableNumber(raw?.priceRange?.max),
      postType: this.asPostType(raw?.postType),
      description:
        typeof raw?.description === 'string' ? raw.description.trim() : '',
      usage: this.mapUsage(completion.usage),
      model,
    };
  }

  async rankMatches(params: {
    interpretation: string;
    candidates: MatchCandidate[];
    imageUrls: string[];
  }): Promise<MatchRankingResult> {
    const candidates = params.candidates.slice(0, MAX_CANDIDATES_TO_RANK);
    // Comparar imágenes contra anuncios sólo justifica el modelo caro si hay imágenes.
    const model = params.imageUrls.length > 0 ? getVisionModel() : AI_TEXT_MODEL;

    const candidatesPayload = candidates.map((candidate) => ({
      postId: candidate.postId,
      title: candidate.title,
      description: (candidate.description ?? '').slice(0, 300),
      price: candidate.price,
      postType: candidate.postType,
      categories: candidate.categoryLabels,
    }));

    const completion = await this.openai.chat.completions.create({
      model,
      messages: [
        { role: 'system', content: MATCH_RANKING_PROMPT },
        {
          role: 'user',
          content: `LO QUE BUSCA EL USUARIO:\n${params.interpretation}\n\nANUNCIOS CANDIDATOS:\n${JSON.stringify(
            candidatesPayload,
          )}`,
        },
      ],
      temperature: 0.2,
      max_tokens: 1200,
      response_format: { type: 'json_object' },
    });

    const raw = parseJsonFromModel<any>(completion.choices[0]?.message?.content);
    const validIds = new Set(candidates.map((candidate) => candidate.postId));

    const matches: RankedMatch[] = (Array.isArray(raw?.matches) ? raw.matches : [])
      // El modelo a veces devuelve ids inventados o repetidos: sólo pasan los reales.
      .filter((match: any) => match && validIds.has(match.postId))
      .map((match: any) => ({
        postId: match.postId as string,
        relevanceScore: Math.max(
          0,
          Math.min(100, Math.round(Number(match.relevanceScore) || 0)),
        ),
        matchReason:
          typeof match.matchReason === 'string' ? match.matchReason.trim() : '',
      }))
      .sort(
        (a: RankedMatch, b: RankedMatch) => b.relevanceScore - a.relevanceScore,
      );

    // Deduplicar por postId conservando el de mayor score.
    const seen = new Set<string>();
    const deduped = matches.filter((match: RankedMatch) => {
      if (seen.has(match.postId)) return false;
      seen.add(match.postId);
      return true;
    });

    return {
      matches: deduped,
      usage: this.mapUsage(completion.usage),
      model,
    };
  }

  private asStringArray(value: any): string[] {
    if (!Array.isArray(value)) return [];
    return value
      .filter((item) => typeof item === 'string')
      .map((item) => item.trim())
      .filter(Boolean);
  }

  private asNullableNumber(value: any): number | null {
    if (value === null || value === undefined || value === '') return null;
    const parsed = Number(value);
    return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
  }

  private asPostType(value: any): string | null {
    const allowed = ['good', 'service', 'petition'];
    return typeof value === 'string' && allowed.includes(value) ? value : null;
  }

  private mapUsage(usage: OpenAI.CompletionUsage | undefined): AiUsage | undefined {
    if (!usage) return undefined;
    return {
      promptTokens: usage.prompt_tokens ?? 0,
      completionTokens: usage.completion_tokens ?? 0,
      totalTokens:
        usage.total_tokens ??
        (usage.prompt_tokens ?? 0) + (usage.completion_tokens ?? 0),
    };
  }
}
