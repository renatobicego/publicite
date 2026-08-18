import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  Agent,
  AgentInputItem,
  assistant,
  run,
  setDefaultOpenAIKey,
  setTracingDisabled,
  user,
} from '@openai/agents';
import { z } from 'zod';

import {
  getValuacionBriefModel,
  getValuacionResultModel,
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
import { ValuacionCategory } from '../entity/enum/valuacion.enums';
import {
  DescriptiveAnalysis,
  EstimatedValues,
  PhotoAnalysis,
  ValuacionBriefItem,
  ValuacionBriefMessage,
  ValuacionDataSourceEntry,
} from '../entity/valuacion.entity';
import { normalizeScore } from './valuacion.scoring';

/** Cuántos mensajes del brief se mandan como contexto. */
const HISTORY_WINDOW = 20;

/** Tope de ítems del checklist dinámico: más que esto es interrogatorio. */
const MAX_BRIEF_ITEMS = 10;

// ─────────────────────── Esquemas de salida (zod) ───────────────────────
// El Agents SDK los convierte en JSON Schema estricto (Responses API): el
// modelo no puede devolver otra forma, así que desaparece el parseo manual.

const BriefItemSchema = z.object({
  key: z.string(),
  label: z.string(),
  status: z.enum(['pendiente', 'cubierto', 'no_aplica', 'omitido']),
});

const BriefTurnOutputSchema = z.object({
  reply: z.string(),
  title: z.string().nullable(),
  briefItems: z.array(BriefItemSchema),
  briefComplete: z.boolean(),
});

const PhotoScoresSchema = z.object({
  estado: z.number(),
  marca: z.number(),
  mercado: z.number(),
  rareza: z.number(),
});

const PhotoAnalysisOutputSchema = z.object({
  description: z.string(),
  brand: z.string().nullable(),
  model: z.string().nullable(),
  condition: z.string(),
  components: z.array(z.string()),
  damages: z.array(z.string()),
  scores: PhotoScoresSchema,
  confidence: z.number(),
});

/**
 * Los 4 ejes descriptivos van como slots fijos + label contextual: el slot
 * mantiene el sticker comparable entre valuaciones, el label dice qué se evaluó
 * de verdad ("mantenimiento" → "Consistencia del servicio" para un servicio).
 */
const DescriptiveAxisSchema = z.object({
  slot: z.enum(['uso', 'vidaUtil', 'mantenimiento', 'documentacion']),
  label: z.string(),
  score: z.number(),
});

const DescriptiveAnalysisOutputSchema = z.object({
  summary: z.string(),
  axes: z.array(DescriptiveAxisSchema),
  confidence: z.number(),
});

const EstimatedValuesOutputSchema = z.object({
  liquidacion: z.number().nullable(),
  mercado: z.number().nullable(),
  premium: z.number().nullable(),
});

const ResultOutputSchema = z.object({
  photoAnalysis: PhotoAnalysisOutputSchema.nullable(),
  descriptiveAnalysis: DescriptiveAnalysisOutputSchema.nullable(),
  estimatedValues: EstimatedValuesOutputSchema.nullable(),
  pricingRationale: z.string().nullable(),
  confidencePercent: z.number(),
  dataSources: z.array(
    z.object({
      field: z.string(),
      source: z.enum(['fotografica', 'descriptiva', 'inferencia_ia']),
    }),
  ),
});

const DESCRIPTIVE_SLOTS = [
  'uso',
  'vidaUtil',
  'mantenimiento',
  'documentacion',
] as const;

/** Labels por defecto cuando el modelo no renombró un eje. */
const DEFAULT_AXIS_LABELS: Record<(typeof DESCRIPTIVE_SLOTS)[number], string> = {
  uso: 'Uso',
  vidaUtil: 'Vida Útil',
  mantenimiento: 'Mantenimiento',
  documentacion: 'Documentación',
};

/** Scores por defecto cuando el modelo no devolvió un slot (neutro = 3). */
const DEFAULT_SCORES: Record<(typeof DESCRIPTIVE_SLOTS)[number], number> = {
  uso: 3,
  vidaUtil: 3,
  mantenimiento: 3,
  documentacion: 3,
};

@Injectable()
export class ValuacionAIService implements ValuacionAIServiceInterface {
  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('OPENAI_API_KEY');
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY is not defined in environment variables');
    }
    setDefaultOpenAIKey(apiKey);
    // Sin tracing hacia el dashboard de OpenAI: mismo perfil de privacidad que
    // tenía la implementación anterior con chat.completions.
    setTracingDisabled(true);
  }

  async runBriefTurn(params: {
    category: ValuacionCategory;
    modeContext?: string;
    title: string | null;
    briefItems: ValuacionBriefItem[];
    history: ValuacionBriefMessage[];
    userMessage: string;
    imageUrls: string[];
  }): Promise<BriefTurnResult> {
    const model = getValuacionBriefModel();
    const hasImages = params.imageUrls.length > 0;

    const agent = new Agent({
      name: 'Cubito Valuador (brief)',
      instructions: buildBriefSystemPrompt({
        category: params.category,
        modeContext: params.modeContext,
        title: params.title,
        briefItems: params.briefItems,
        hasImages,
      }),
      model,
      // Esfuerzo de razonamiento bajo: el chat tiene que responder rápido y
      // alcanza para decidir qué ítems aplican. store:false = no persistir
      // requests en OpenAI.
      modelSettings: { reasoning: { effort: 'low' }, store: false },
      outputType: BriefTurnOutputSchema,
    });

    const input: AgentInputItem[] = [
      ...this.mapHistory(params.history),
      await this.buildUserInput(params.userMessage, params.imageUrls),
    ];

    try {
      const result = await run(agent, input);
      const output = result.finalOutput;
      if (!output) throw new Error('La IA no devolvió salida estructurada');

      return {
        reply:
          output.reply?.trim() ||
          'Contame un poco más sobre lo que querés valuar 🙂',
        title: this.asNullableString(output.title),
        briefItems: this.sanitizeBriefItems(output.briefItems),
        briefComplete: output.briefComplete === true,
        usage: this.collectUsage(result.rawResponses),
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
    title: string | null;
    history: ValuacionBriefMessage[];
    imageUrls: string[];
    comparables?: ValuacionComparable[];
  }): Promise<ValuacionResultPayload> {
    const model = getValuacionResultModel();
    const hasImages = params.imageUrls.length > 0;

    const agent = new Agent({
      name: 'Cubito Valuador (informe)',
      instructions: `${VALUACION_RESULT_PROMPT}

CATEGORÍA: ${params.category}
${params.title ? `ÍTEM VALUADO: ${params.title}` : ''}
${params.modeContext ? `\nMODO ESPECIALISTA ACTIVO:\n${params.modeContext}` : ''}${buildComparablesSection(params.comparables ?? [])}`,
      model,
      // El informe es la salida que el usuario guarda y publica: acá el modelo
      // razona en serio (los valores estimados salen de esta llamada).
      modelSettings: { reasoning: { effort: 'medium' }, store: false },
      outputType: ResultOutputSchema,
    });

    const input: AgentInputItem[] = [
      ...this.mapHistory(params.history),
      await this.buildUserInput(
        'Generá ahora el informe de valuación con toda la información de esta conversación.',
        params.imageUrls,
      ),
    ];

    try {
      const result = await run(agent, input);
      const output = result.finalOutput;
      if (!output) throw new Error('La IA no devolvió salida estructurada');

      return {
        photoAnalysis: this.normalizePhotoAnalysis(
          output.photoAnalysis,
          hasImages,
        ),
        descriptiveAnalysis: this.normalizeDescriptiveAnalysis(
          output.descriptiveAnalysis,
        ),
        estimatedValues: this.normalizeEstimatedValues(output.estimatedValues),
        pricingRationale: this.asNullableString(output.pricingRationale),
        confidencePercent: this.clampPercent(output.confidencePercent),
        dataSources: this.normalizeDataSources(output.dataSources),
        usage: this.collectUsage(result.rawResponses),
        model,
      };
    } catch (error: any) {
      console.error('Error generando resultado de valuación:', error);
      throw new Error(
        `Error generando el resultado de la valuación: ${error.message}`,
      );
    }
  }

  // ─────────────────────────── armado del input ───────────────────────────

  private mapHistory(history: ValuacionBriefMessage[]): AgentInputItem[] {
    return history
      .slice(-HISTORY_WINDOW)
      .map((message) =>
        message.role === 'user'
          ? user(message.content)
          : assistant(message.content),
      );
  }

  /**
   * Arma el mensaje del usuario adjuntando las imágenes como data URLs.
   * Se descargan acá porque OpenAI no siempre puede bajar directo desde
   * UploadThing (timeouts); si una descarga falla se manda la URL original.
   */
  private async buildUserInput(
    text: string,
    imageUrls: string[],
  ): Promise<AgentInputItem> {
    if (imageUrls.length === 0) {
      return user(text);
    }

    const imageContents = await Promise.all(
      imageUrls.map(async (url) => {
        try {
          const response = await fetch(url);
          const arrayBuffer = await response.arrayBuffer();
          const base64 = Buffer.from(arrayBuffer).toString('base64');
          const contentType =
            response.headers.get('content-type') || 'image/jpeg';
          return {
            type: 'input_image' as const,
            image: `data:${contentType};base64,${base64}`,
          };
        } catch (err) {
          console.warn(`No se pudo descargar imagen ${url}:`, err);
          return { type: 'input_image' as const, image: url };
        }
      }),
    );

    return user([{ type: 'input_text', text }, ...imageContents]);
  }

  // ─────────────────────────── normalización ───────────────────────────
  // El esquema estricto garantiza la FORMA, pero los VALORES igual se acotan
  // acá: rangos 1-5, orden liquidación <= mercado <= premium, etc.

  private sanitizeBriefItems(raw: unknown): ValuacionBriefItem[] {
    if (!Array.isArray(raw)) return [];
    const seen = new Set<string>();
    const items: ValuacionBriefItem[] = [];
    for (const entry of raw) {
      const key = typeof entry?.key === 'string' ? entry.key.trim() : '';
      const label = typeof entry?.label === 'string' ? entry.label.trim() : '';
      const status = entry?.status;
      if (!key || !label || seen.has(key)) continue;
      if (!['pendiente', 'cubierto', 'no_aplica', 'omitido'].includes(status)) {
        continue;
      }
      seen.add(key);
      items.push({ key, label: label.slice(0, 60), status });
      if (items.length >= MAX_BRIEF_ITEMS) break;
    }
    return items;
  }

  private normalizePhotoAnalysis(
    raw: z.infer<typeof PhotoAnalysisOutputSchema> | null,
    hasImages: boolean,
  ): PhotoAnalysis | null {
    // Sin imágenes no puede haber análisis fotográfico, por más que el modelo
    // lo haya inventado.
    if (!hasImages || !raw) return null;

    return {
      description: this.asString(raw.description),
      brand: this.asNullableString(raw.brand),
      model: this.asNullableString(raw.model),
      condition: this.asString(raw.condition),
      components: this.asStringArray(raw.components),
      damages: this.asStringArray(raw.damages),
      scores: {
        estado: normalizeScore(raw.scores?.estado) ?? 3,
        marca: normalizeScore(raw.scores?.marca) ?? 3,
        mercado: normalizeScore(raw.scores?.mercado) ?? 3,
        rareza: normalizeScore(raw.scores?.rareza) ?? 3,
      },
      confidence: this.clampPercent(raw.confidence),
    };
  }

  private normalizeDescriptiveAnalysis(
    raw: z.infer<typeof DescriptiveAnalysisOutputSchema> | null,
  ): DescriptiveAnalysis | null {
    if (!raw) return null;

    const scores = { ...DEFAULT_SCORES };
    const axisLabels = { ...DEFAULT_AXIS_LABELS };
    for (const axis of raw.axes ?? []) {
      if (!DESCRIPTIVE_SLOTS.includes(axis.slot)) continue;
      scores[axis.slot] = normalizeScore(axis.score) ?? 3;
      const label = this.asString(axis.label);
      if (label) axisLabels[axis.slot] = label.slice(0, 40);
    }

    return {
      summary: this.asString(raw.summary),
      scores,
      axisLabels,
      confidence: this.clampPercent(raw.confidence),
    };
  }

  /**
   * Los tres valores tienen que respetar liquidación <= mercado <= premium.
   * Si el modelo los devuelve desordenados se reordenan en vez de descartarlos:
   * el orden es una regla del negocio, no una opinión del modelo.
   */
  private normalizeEstimatedValues(
    raw: z.infer<typeof EstimatedValuesOutputSchema> | null,
  ): EstimatedValues | null {
    if (!raw) return null;

    const values = [raw.liquidacion, raw.mercado, raw.premium]
      .map((value) => {
        if (value === null || value === undefined) return null;
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

  private normalizeDataSources(
    raw: { field: string; source: string }[],
  ): ValuacionDataSourceEntry[] {
    if (!Array.isArray(raw)) return [];
    return raw
      .filter((entry) => entry && typeof entry.field === 'string')
      .map((entry) => ({
        field: entry.field,
        source: entry.source as ValuacionDataSourceEntry['source'],
      }));
  }

  private collectUsage(
    responses: {
      usage?: {
        inputTokens?: number;
        outputTokens?: number;
        totalTokens?: number;
      };
    }[],
  ): AiUsage | undefined {
    let promptTokens = 0;
    let completionTokens = 0;
    let found = false;
    for (const response of responses ?? []) {
      if (!response?.usage) continue;
      found = true;
      promptTokens += response.usage.inputTokens ?? 0;
      completionTokens += response.usage.outputTokens ?? 0;
    }
    if (!found) return undefined;
    return {
      promptTokens,
      completionTokens,
      totalTokens: promptTokens + completionTokens,
    };
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
}
