import { Document, Schema } from 'mongoose';
import {
  ValuacionBriefField,
  ValuacionCategory,
  ValuacionDataSource,
  ValuacionStatus,
} from '../../domain/entity/enum/valuacion.enums';

export interface ValuacionDocument extends Document {
  userId: string;
  sessionId?: string;
  postId?: Schema.Types.ObjectId | null;
  category: string;
  status: string;
  mode?: string;
  title?: string | null;
  layer: number;
  completionPercent: number;
  confidencePercent: number;
  coveredFields: string[];
  notApplicableFields: string[];
  briefItems: { key: string; label: string; status: string }[];
  briefMessages: {
    role: string;
    content: string;
    timestamp: Date;
  }[];
  briefAnswers: {
    field?: string;
    question: string;
    answer: string;
    skipped: boolean;
    source: string;
  }[];
  images: {
    url: string;
    uploadedAt: Date;
    analysisNotes?: string;
  }[];
  photoAnalysis?: any;
  descriptiveAnalysis?: any;
  estimatedValues?: any;
  pricingRationale?: string | null;
  finalScore?: number;
  dataSources: { field: string; source: string }[];
  versions: any[];
  deletedAt?: Date | null;
}

const ScoreField = { type: Number, min: 1, max: 5 };

const PhotoAnalysisSchema = new Schema(
  {
    description: { type: String },
    brand: { type: String, default: null },
    model: { type: String, default: null },
    condition: { type: String },
    components: [{ type: String }],
    damages: [{ type: String }],
    scores: {
      estado: ScoreField,
      marca: ScoreField,
      mercado: ScoreField,
      rareza: ScoreField,
    },
    confidence: { type: Number, min: 0, max: 100 },
  },
  { _id: false },
);

const DescriptiveAnalysisSchema = new Schema(
  {
    summary: { type: String },
    scores: {
      uso: ScoreField,
      vidaUtil: ScoreField,
      mantenimiento: ScoreField,
      documentacion: ScoreField,
    },
    /**
     * Etiquetas contextuales de los 4 slots (los slots son fijos para que el
     * sticker sea comparable; el label es lo que realmente se evaluó, ej.
     * "mantenimiento" → "Consistencia del servicio"). null en valuaciones viejas.
     */
    axisLabels: {
      type: {
        uso: { type: String },
        vidaUtil: { type: String },
        mantenimiento: { type: String },
        documentacion: { type: String },
      },
      default: null,
      _id: false,
    },
    confidence: { type: Number, min: 0, max: 100 },
  },
  { _id: false },
);

const EstimatedValuesSchema = new Schema(
  {
    liquidacion: { type: Number, default: null },
    mercado: { type: Number, default: null },
    premium: { type: Number, default: null },
    currency: { type: String, default: 'USD' },
  },
  { _id: false },
);

/**
 * Valuación IA.
 *
 * Notas de diseño:
 * - `briefMessages` guarda la conversación del brief acá y no en ChatSession:
 *   el brief tiene el mismo ciclo de vida que la valuación (se archiva, versiona
 *   y borra con ella), mientras que las sesiones de chat tienen otra retención.
 * - `layer` y `completionPercent` los calcula el backend (valuacion.scoring.ts),
 *   nunca la IA: el sticker debe ser comparable entre valuaciones.
 * - El borrado es lógico (`deletedAt` + status archived) porque el AC06 del
 *   Tablero pide explícitamente no perder el registro ni los tokens gastados.
 */
export const ValuacionSchema = new Schema<ValuacionDocument>(
  {
    // Sin `index: true`: el índice compuesto { userId, createdAt } de más abajo
    // ya cubre las búsquedas por userId, y declarar ambos crearía un índice
    // extra que no aporta.
    userId: { type: String, required: true },
    sessionId: { type: String, index: true },
    postId: { type: Schema.Types.ObjectId, ref: 'Post', default: null },

    category: {
      type: String,
      enum: Object.values(ValuacionCategory),
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(ValuacionStatus),
      default: ValuacionStatus.draft,
    },
    /** Modo de Cubito con el que se corre el brief (ver cubito-modes.ts). */
    mode: { type: String },

    /** Identificación corta de lo que se valúa, generada por la IA en el brief. */
    title: { type: String, default: null, maxlength: 120 },

    layer: { type: Number, enum: [1, 2, 3], default: 1 },
    completionPercent: { type: Number, default: 0, min: 0, max: 100 },
    confidencePercent: { type: Number, default: 0, min: 0, max: 100 },

    /** Ejes del brief ya cubiertos; base del cálculo de completitud. */
    coveredFields: [
      { type: String, enum: Object.values(ValuacionBriefField) },
    ],

    /** Ejes que no aplican a este ítem; cuentan como resueltos, no como faltantes. */
    notApplicableFields: [
      { type: String, enum: Object.values(ValuacionBriefField) },
    ],

    /**
     * Checklist dinámico del brief: la IA lo arma según QUÉ se valúa (talle
     * para zapatillas, experiencia para un servicio). En valuaciones nuevas la
     * completitud se calcula sobre esta lista; coveredFields queda como legado.
     */
    briefItems: [
      {
        key: { type: String, required: true },
        label: { type: String, required: true },
        status: {
          type: String,
          enum: ['pendiente', 'cubierto', 'no_aplica', 'omitido'],
          default: 'pendiente',
        },
        _id: false,
      },
    ],

    briefMessages: [
      {
        role: { type: String, required: true, enum: ['user', 'assistant'] },
        content: { type: String, required: true },
        timestamp: { type: Date, default: Date.now },
      },
    ],

    briefAnswers: [
      {
        field: { type: String, enum: Object.values(ValuacionBriefField) },
        question: { type: String },
        answer: { type: String },
        skipped: { type: Boolean, default: false },
        source: {
          type: String,
          enum: ['user', 'photo', 'inference'],
          default: 'user',
        },
      },
    ],

    images: [
      {
        url: { type: String, required: true },
        uploadedAt: { type: Date, default: Date.now },
        analysisNotes: { type: String },
      },
    ],

    photoAnalysis: { type: PhotoAnalysisSchema, default: null },
    descriptiveAnalysis: { type: DescriptiveAnalysisSchema, default: null },
    estimatedValues: { type: EstimatedValuesSchema, default: null },

    /** Justificación breve de los valores estimados (transparencia del precio). */
    pricingRationale: { type: String, default: null, maxlength: 1000 },

    finalScore: { type: Number, min: 1, max: 5, default: null },

    dataSources: [
      {
        field: { type: String },
        source: { type: String, enum: Object.values(ValuacionDataSource) },
      },
    ],

    /** Snapshots de resultados anteriores (historial de versiones). */
    versions: [
      {
        generatedAt: { type: Date, default: Date.now },
        layer: { type: Number },
        completionPercent: { type: Number },
        confidencePercent: { type: Number },
        finalScore: { type: Number },
        photoAnalysis: { type: PhotoAnalysisSchema },
        descriptiveAnalysis: { type: DescriptiveAnalysisSchema },
        estimatedValues: { type: EstimatedValuesSchema },
      },
    ],

    deletedAt: { type: Date, default: null },
  },
  { timestamps: true, collection: 'valuaciones' },
);

ValuacionSchema.index({ userId: 1, createdAt: -1 });
ValuacionSchema.index({ postId: 1 });
ValuacionSchema.index({ status: 1 });
ValuacionSchema.index({ deletedAt: 1 });
