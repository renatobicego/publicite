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
  ImageAnalysisResult,
  ValuacionAIServiceInterface,
  ValuacionComparable,
  ValuacionResultPayload,
} from './valuacion.ai.service.interface';
import {
  buildBriefSystemPrompt,
  buildComparablesSection,
  buildImageNotesSection,
  IMAGE_ANALYSIS_PROMPT,
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

/**
 * Tope de las notas de cada foto. Viajan en el prompt de TODOS los turnos, así
 * que un párrafo desbocado se paga muchas veces.
 */
const MAX_IMAGE_NOTES_LENGTH = 900;

/**
 * Nota que se persiste cuando el análisis de una foto falla. Se guarda igual
 * (en vez de dejar la imagen sin notas) para no reintentarla en cada turno del
 * brief: el reintento infinito costaría más que la foto perdida.
 */
const IMAGE_ANALYSIS_FALLBACK_NOTES =
  'No se pudo analizar esta foto automáticamente; no hay observaciones visuales de ella.';

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

const ImageNotesOutputSchema = z.object({
  notes: z.string(),
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
    imageNotes: string[];
  }): Promise<BriefTurnResult> {
    const model = getValuacionBriefModel();

    const agent = new Agent({
      name: 'Cubito Valuador (brief)',
      instructions: buildBriefSystemPrompt({
        category: params.category,
        modeContext: params.modeContext,
        title: params.title,
        briefItems: params.briefItems,
        imageNotes: params.imageNotes,
      }),
      model,
      // Esfuerzo de razonamiento bajo: el chat tiene que responder rápido y
      // alcanza para decidir qué ítems aplican. store:false = no persistir
      // requests en OpenAI.
      modelSettings: { reasoning: { effort: 'low' }, store: false },
      outputType: BriefTurnOutputSchema,
    });

    // Las fotos NO se re-adjuntan: ya vienen analizadas dentro de las
    // instrucciones (imageNotes). El turno del brief es texto puro.
    const input: AgentInputItem[] = [
      ...this.mapHistory(params.history),
      user(params.userMessage),
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
    imageNotes: string[];
    comparables?: ValuacionComparable[];
  }): Promise<ValuacionResultPayload> {
    const model = getValuacionResultModel();
    const hasImages = params.imageNotes.length > 0;

    const agent = new Agent({
      name: 'Cubito Valuador (informe)',
      instructions: `${VALUACION_RESULT_PROMPT}

CATEGORÍA: ${params.category}
${params.title ? `ÍTEM VALUADO: ${params.title}` : ''}
${params.modeContext ? `\nMODO ESPECIALISTA ACTIVO:\n${params.modeContext}` : ''}${buildImageNotesSection(params.imageNotes)}${buildComparablesSection(params.comparables ?? [])}`,
      model,
      // El informe es la salida que el usuario guarda y publica: acá el modelo
      // razona en serio (los valores estimados salen de esta llamada).
      modelSettings: { reasoning: { effort: 'medium' }, store: false },
      outputType: ResultOutputSchema,
    });

    const input: AgentInputItem[] = [
      ...this.mapHistory(params.history),
      user(
        'Generá ahora el informe de valuación con toda la información de esta conversación.',
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

  /**
   * Analiza cada foto UNA sola vez y devuelve las notas que la representan de
   * acá en más.
   *
   * Esto es lo que reemplaza al reenvío de imágenes: el brief y el informe
   * consumen texto, y los píxeles se miran una única vez en la vida de la
   * valuación. Por eso el prompt del perito pide detalle: nadie va a volver a
   * abrir la foto para chequear un dato que quedó afuera.
   *
   * Una llamada por imagen y en paralelo: cada foto se describe sola, y si una
   * falla no se lleva puestas a las demás.
   */
  async analyzeImages(params: {
    category: ValuacionCategory;
    title: string | null;
    imageUrls: string[];
  }): Promise<ImageAnalysisResult> {
    const model = getValuacionBriefModel();
    if (params.imageUrls.length === 0) return { notes: [], model };

    const agent = new Agent({
      name: 'Cubito Valuador (perito visual)',
      instructions: `${IMAGE_ANALYSIS_PROMPT}

CATEGORÍA ELEGIDA POR EL USUARIO: ${params.category}${
        params.title ? `\nEL USUARIO DIJO QUE VALÚA: ${params.title}` : ''
      }`,
      model,
      modelSettings: { reasoning: { effort: 'low' }, store: false },
      outputType: ImageNotesOutputSchema,
    });

    const analyses = await Promise.all(
      params.imageUrls.map(async (url) => {
        try {
          const input = [await this.buildUserInput('Analizá esta foto.', [url])];
          const result = await run(agent, input);
          const notes = this.asString(result.finalOutput?.notes);
          return {
            url,
            notes: notes
              ? this.trimImageNotes(notes)
              : IMAGE_ANALYSIS_FALLBACK_NOTES,
            usage: this.collectUsage(result.rawResponses),
          };
        } catch (error: any) {
          console.error(`Error analizando la imagen ${url}:`, error?.message);
          return {
            url,
            notes: IMAGE_ANALYSIS_FALLBACK_NOTES,
            usage: undefined as AiUsage | undefined,
          };
        }
      }),
    );

    return {
      notes: analyses.map(({ url, notes }) => ({ url, notes })),
      // Las N llamadas se cobran juntas: para la cuota es un solo evento
      // "analicé las fotos de esta valuación".
      usage: this.mergeUsage(analyses.map((analysis) => analysis.usage)),
      model,
    };
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
   *
   * Lo usa únicamente analyzeImages(): es el único punto del módulo donde los
   * bytes de una foto viajan a OpenAI.
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

  /**
   * Recorta las notas de una foto sin partir una palabra al medio: se guardan
   * una sola vez y se leen en todos los turnos, así que una frase cortada a la
   * mitad se arrastra hasta el informe.
   */
  private trimImageNotes(notes: string): string {
    if (notes.length <= MAX_IMAGE_NOTES_LENGTH) return notes;
    const cut = notes.slice(0, MAX_IMAGE_NOTES_LENGTH);
    const lastSpace = cut.lastIndexOf(' ');
    const trimmed = lastSpace > MAX_IMAGE_NOTES_LENGTH * 0.8 ? cut.slice(0, lastSpace) : cut;
    return `${trimmed.trimEnd()}…`;
  }

  /** Suma varios usages en uno solo; undefined si ninguna llamada lo informó. */
  private mergeUsage(usages: (AiUsage | undefined)[]): AiUsage | undefined {
    const present = usages.filter((usage): usage is AiUsage => !!usage);
    if (present.length === 0) return undefined;
    const promptTokens = present.reduce(
      (total, usage) => total + usage.promptTokens,
      0,
    );
    const completionTokens = present.reduce(
      (total, usage) => total + usage.completionTokens,
      0,
    );
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
