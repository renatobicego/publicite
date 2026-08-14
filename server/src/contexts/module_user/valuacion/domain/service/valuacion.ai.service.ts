import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';

import {
  AI_TEXT_MODEL,
  getVisionModel,
  parseJsonFromModel,
} from 'src/contexts/module_shared/ai/ai.config';
import { AiUsage } from 'src/contexts/module_user/chatbot/domain/entity/chatbot.token.types';
import {
  BriefTurnResult,
  ValuacionAIServiceInterface,
  ValuacionComparable,
  ValuacionResultPayload,
} from './valuacion.ai.service.interface';
import {
  buildBriefSystemPrompt,
  buildComparablesSection,
  VALUACION_RESULT_PROMPT,
} from './valuacion.prompts';
import {
  ValuacionCategory,
  ValuacionDataSource,
} from '../entity/enum/valuacion.enums';
import {
  DescriptiveAnalysis,
  EstimatedValues,
  PhotoAnalysis,
  ValuacionBriefMessage,
  ValuacionDataSourceEntry,
} from '../entity/valuacion.entity';
import { normalizeScore } from './valuacion.scoring';

const VALUACION_DATA_SOURCES: string[] = Object.values(ValuacionDataSource);

/** Cuántos mensajes del brief se mandan como contexto. */
const HISTORY_WINDOW = 20;

@Injectable()
export class ValuacionAIService implements ValuacionAIServiceInterface {
  private openai: OpenAI;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('OPENAI_API_KEY');
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY is not defined in environment variables');
    }
    this.openai = new OpenAI({ apiKey });
  }

  async runBriefTurn(params: {
    category: ValuacionCategory;
    modeContext?: string;
    coveredFields: string[];
    notApplicableFields?: string[];
    history: ValuacionBriefMessage[];
    userMessage: string;
    imageUrls: string[];
  }): Promise<BriefTurnResult> {
    const hasImages = params.imageUrls.length > 0;
    // Visión sólo cuando hace falta: gpt-4o cuesta ~10x más por token.
    const model = hasImages ? getVisionModel() : AI_TEXT_MODEL;

    const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
      {
        role: 'system',
        content: buildBriefSystemPrompt({
          category: params.category,
          modeContext: params.modeContext,
          coveredFields: params.coveredFields,
          notApplicableFields: params.notApplicableFields,
          hasImages,
        }),
      },
      ...this.mapHistory(params.history),
      this.buildUserMessage(params.userMessage, params.imageUrls),
    ];

    try {
      const completion = await this.openai.chat.completions.create({
        model,
        messages,
        temperature: 0.6,
        max_tokens: 600,
        response_format: { type: 'json_object' },
      });

      const parsed = parseJsonFromModel<{
        reply?: string;
        coveredFields?: string[];
        notApplicableFields?: string[];
        briefComplete?: boolean;
      }>(completion.choices[0]?.message?.content);

      return {
        reply:
          parsed.reply?.trim() ||
          'Contame un poco más sobre lo que querés valuar 🙂',
        coveredFields: Array.isArray(parsed.coveredFields)
          ? parsed.coveredFields.filter((field) => typeof field === 'string')
          : [],
        notApplicableFields: Array.isArray(parsed.notApplicableFields)
          ? parsed.notApplicableFields.filter(
              (field) => typeof field === 'string',
            )
          : [],
        briefComplete: parsed.briefComplete === true,
        usage: this.mapUsage(completion.usage),
        model,
      };
    } catch (error: any) {
      console.error('Error en turno de brief de valuación:', error);
      throw new Error(`Error generando la respuesta del brief: ${error.message}`);
    }
  }

  async generateResult(params: {
    category: ValuacionCategory;
    modeContext?: string;
    history: ValuacionBriefMessage[];
    imageUrls: string[];
    comparables?: ValuacionComparable[];
  }): Promise<ValuacionResultPayload> {
    // El informe final siempre usa el modelo bueno: es la salida que el usuario
    // guarda, comparte y asocia a un anuncio.
    const model = getVisionModel();

    const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
      {
        role: 'system',
        content: `${VALUACION_RESULT_PROMPT}

CATEGORÍA: ${params.category}
${params.modeContext ? `\nMODO ESPECIALISTA ACTIVO:\n${params.modeContext}` : ''}${buildComparablesSection(params.comparables ?? [])}`,
      },
      ...this.mapHistory(params.history),
      this.buildUserMessage(
        'Generá ahora el informe de valuación en JSON con toda la información de esta conversación.',
        params.imageUrls,
      ),
    ];

    try {
      const completion = await this.openai.chat.completions.create({
        model,
        messages,
        temperature: 0.3,
        max_tokens: 1600,
        response_format: { type: 'json_object' },
      });

      const raw = parseJsonFromModel<any>(
        completion.choices[0]?.message?.content,
      );

      return {
        photoAnalysis: this.normalizePhotoAnalysis(
          raw?.photoAnalysis,
          params.imageUrls.length > 0,
        ),
        descriptiveAnalysis: this.normalizeDescriptiveAnalysis(
          raw?.descriptiveAnalysis,
        ),
        estimatedValues: this.normalizeEstimatedValues(raw?.estimatedValues),
        confidencePercent: this.clampPercent(raw?.confidencePercent),
        dataSources: this.normalizeDataSources(raw?.dataSources),
        usage: this.mapUsage(completion.usage),
        model,
      };
    } catch (error: any) {
      console.error('Error generando resultado de valuación:', error);
      throw new Error(`Error generando el resultado de la valuación: ${error.message}`);
    }
  }

  private mapHistory(
    history: ValuacionBriefMessage[],
  ): OpenAI.Chat.Completions.ChatCompletionMessageParam[] {
    return history.slice(-HISTORY_WINDOW).map((message) => ({
      role: message.role === 'user' ? ('user' as const) : ('assistant' as const),
      content: message.content,
    }));
  }

  /** Arma el mensaje del usuario adjuntando las imágenes como content parts. */
  private buildUserMessage(
    text: string,
    imageUrls: string[],
  ): OpenAI.Chat.Completions.ChatCompletionMessageParam {
    if (imageUrls.length === 0) {
      return { role: 'user', content: text };
    }

    return {
      role: 'user',
      content: [
        { type: 'text', text },
        ...imageUrls.map((url) => ({
          type: 'image_url' as const,
          image_url: { url, detail: 'low' as const },
        })),
      ],
    };
  }

  private normalizePhotoAnalysis(
    raw: any,
    hasImages: boolean,
  ): PhotoAnalysis | null {
    // Sin imágenes no puede haber análisis fotográfico, por más que el modelo
    // lo haya inventado.
    if (!hasImages || !raw || typeof raw !== 'object') return null;

    const scores = raw.scores ?? {};
    const normalized = {
      estado: normalizeScore(scores.estado),
      marca: normalizeScore(scores.marca),
      mercado: normalizeScore(scores.mercado),
      rareza: normalizeScore(scores.rareza),
    };
    if (Object.values(normalized).every((score) => score === null)) return null;

    return {
      description: this.asString(raw.description),
      brand: this.asNullableString(raw.brand),
      model: this.asNullableString(raw.model),
      condition: this.asString(raw.condition),
      components: this.asStringArray(raw.components),
      damages: this.asStringArray(raw.damages),
      scores: {
        estado: normalized.estado ?? 3,
        marca: normalized.marca ?? 3,
        mercado: normalized.mercado ?? 3,
        rareza: normalized.rareza ?? 3,
      },
      confidence: this.clampPercent(raw.confidence),
    };
  }

  private normalizeDescriptiveAnalysis(raw: any): DescriptiveAnalysis | null {
    if (!raw || typeof raw !== 'object') return null;

    const scores = raw.scores ?? {};
    const normalized = {
      uso: normalizeScore(scores.uso),
      vidaUtil: normalizeScore(scores.vidaUtil),
      mantenimiento: normalizeScore(scores.mantenimiento),
      documentacion: normalizeScore(scores.documentacion),
    };
    if (Object.values(normalized).every((score) => score === null)) return null;

    return {
      summary: this.asString(raw.summary),
      scores: {
        uso: normalized.uso ?? 3,
        vidaUtil: normalized.vidaUtil ?? 3,
        mantenimiento: normalized.mantenimiento ?? 3,
        documentacion: normalized.documentacion ?? 3,
      },
      confidence: this.clampPercent(raw.confidence),
    };
  }

  /**
   * Los tres valores tienen que respetar liquidación <= mercado <= premium.
   * Si el modelo los devuelve desordenados se reordenan en vez de descartarlos:
   * el orden es una regla del negocio, no una opinión del modelo.
   */
  private normalizeEstimatedValues(raw: any): EstimatedValues | null {
    if (!raw || typeof raw !== 'object') return null;

    const values = [raw.liquidacion, raw.mercado, raw.premium]
      .map((value) => {
        // Mismo cuidado que en normalizeScore: Number(null) es 0, y un valor
        // ausente no puede terminar publicado como "vale USD 0".
        if (value === null || value === undefined || value === '') return null;
        if (typeof value !== 'number' && typeof value !== 'string') return null;
        const parsed = Number(value);
        return Number.isFinite(parsed) && parsed > 0 ? Math.round(parsed) : null;
      })
      .filter((value): value is number => value !== null);

    if (values.length === 0) return null;

    const sorted = [...values].sort((a, b) => a - b);
    return {
      liquidacion: sorted[0] ?? null,
      mercado: sorted[1] ?? sorted[0] ?? null,
      premium: sorted[2] ?? sorted[sorted.length - 1] ?? null,
      currency: 'USD',
    };
  }

  private normalizeDataSources(raw: any): ValuacionDataSourceEntry[] {
    if (!Array.isArray(raw)) return [];
    return raw
      .filter(
        (entry) =>
          entry &&
          typeof entry.field === 'string' &&
          VALUACION_DATA_SOURCES.includes(entry.source),
      )
      .map((entry) => ({ field: entry.field, source: entry.source }));
  }

  private clampPercent(value: any): number {
    const parsed = Number(value);
    if (!Number.isFinite(parsed)) return 0;
    return Math.max(0, Math.min(100, Math.round(parsed)));
  }

  private asString(value: any): string {
    return typeof value === 'string' ? value.trim() : '';
  }

  private asNullableString(value: any): string | null {
    if (typeof value !== 'string') return null;
    const trimmed = value.trim();
    if (!trimmed || trimmed.toLowerCase() === 'null') return null;
    return trimmed;
  }

  private asStringArray(value: any): string[] {
    if (!Array.isArray(value)) return [];
    return value
      .filter((item) => typeof item === 'string')
      .map((item) => item.trim())
      .filter(Boolean);
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
