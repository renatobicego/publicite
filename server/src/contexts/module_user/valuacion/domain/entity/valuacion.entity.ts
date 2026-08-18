import {
  ValuacionBriefField,
  ValuacionCategory,
  ValuacionDataSource,
  ValuacionStatus,
} from './enum/valuacion.enums';

export interface ValuacionBriefMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface ValuacionBriefAnswer {
  field?: ValuacionBriefField;
  question: string;
  answer: string;
  skipped: boolean;
  source: 'user' | 'photo' | 'inference';
}

/**
 * Estado de un ítem del checklist dinámico del brief.
 * - pendiente: falta preguntarlo
 * - cubierto:  el usuario lo respondió (o se dedujo de fotos/contexto)
 * - no_aplica: no tiene sentido para este ítem (no se pregunta ni penaliza)
 * - omitido:   el usuario prefirió no responder (penaliza la completitud, AC08)
 */
export type ValuacionBriefItemStatus =
  | 'pendiente'
  | 'cubierto'
  | 'no_aplica'
  | 'omitido';

/**
 * Ítem del checklist dinámico del brief. A diferencia de los 8 ejes fijos
 * (coveredFields, legado), estos los define la IA según QUÉ se está valuando:
 * unas zapatillas nuevas piden talle y autenticidad, un servicio pide
 * experiencia y clientela. La completitud se calcula sobre esta lista.
 */
export interface ValuacionBriefItem {
  key: string;
  label: string;
  status: ValuacionBriefItemStatus;
}

export interface ValuacionImage {
  url: string;
  uploadedAt: Date;
  analysisNotes?: string;
}

export interface PhotoAnalysis {
  description: string;
  brand: string | null;
  model: string | null;
  condition: string;
  components: string[];
  damages: string[];
  scores: {
    estado: number;
    marca: number;
    mercado: number;
    rareza: number;
  };
  confidence: number;
}

export interface DescriptiveAnalysis {
  summary: string;
  scores: {
    uso: number;
    vidaUtil: number;
    mantenimiento: number;
    documentacion: number;
  };
  /**
   * Etiquetas contextuales de los 4 slots de score. Los slots son fijos para
   * que el sticker sea comparable, pero "mantenimiento" en un servicio se
   * muestra como lo que realmente se evaluó (ej. "Consistencia del servicio").
   * null en valuaciones viejas: el front cae a las etiquetas clásicas.
   */
  axisLabels?: {
    uso: string;
    vidaUtil: string;
    mantenimiento: string;
    documentacion: string;
  } | null;
  confidence: number;
}

export interface EstimatedValues {
  liquidacion: number | null;
  mercado: number | null;
  premium: number | null;
  currency: string;
}

export interface ValuacionDataSourceEntry {
  field: string;
  source: ValuacionDataSource;
}

export interface ValuacionVersion {
  generatedAt: Date;
  layer: number;
  completionPercent: number;
  confidencePercent: number;
  finalScore?: number;
  photoAnalysis?: PhotoAnalysis;
  descriptiveAnalysis?: DescriptiveAnalysis;
  estimatedValues?: EstimatedValues;
}

export class ValuacionEntity {
  readonly _id?: string;
  readonly userId: string;
  readonly sessionId?: string;
  readonly postId?: string | null;
  readonly category: ValuacionCategory;
  readonly status: ValuacionStatus;
  readonly mode?: string;
  /** Identificación corta de lo que se valúa, generada por la IA durante el brief. */
  readonly title?: string | null;
  readonly layer: number;
  readonly completionPercent: number;
  readonly confidencePercent: number;
  readonly coveredFields: ValuacionBriefField[];
  /**
   * Ejes que NO aplican a lo que se está valuando (ej. mantenimiento en algo
   * nuevo). Cuentan como resueltos para la completitud: no tener historial de
   * mantenimiento no es información faltante si el objeto es 0km.
   */
  readonly notApplicableFields: ValuacionBriefField[];
  /**
   * Checklist dinámico del brief (reemplaza a los 8 ejes fijos en valuaciones
   * nuevas). Cuando está vacío, la completitud cae al cálculo legado sobre
   * coveredFields/notApplicableFields.
   */
  readonly briefItems: ValuacionBriefItem[];
  readonly briefMessages: ValuacionBriefMessage[];
  readonly briefAnswers: ValuacionBriefAnswer[];
  readonly images: ValuacionImage[];
  readonly photoAnalysis?: PhotoAnalysis | null;
  readonly descriptiveAnalysis?: DescriptiveAnalysis | null;
  readonly estimatedValues?: EstimatedValues | null;
  /** Justificación breve de los valores estimados (en qué se basó la IA). */
  readonly pricingRationale?: string | null;
  readonly finalScore?: number | null;
  readonly dataSources: ValuacionDataSourceEntry[];
  readonly versions: ValuacionVersion[];
  readonly deletedAt?: Date | null;
  readonly createdAt?: Date;
  readonly updatedAt?: Date;

  constructor(params: {
    _id?: string;
    userId: string;
    sessionId?: string;
    postId?: string | null;
    category: ValuacionCategory;
    status: ValuacionStatus;
    mode?: string;
    title?: string | null;
    layer: number;
    completionPercent: number;
    confidencePercent: number;
    coveredFields: ValuacionBriefField[];
    notApplicableFields?: ValuacionBriefField[];
    briefItems?: ValuacionBriefItem[];
    briefMessages: ValuacionBriefMessage[];
    briefAnswers: ValuacionBriefAnswer[];
    images: ValuacionImage[];
    photoAnalysis?: PhotoAnalysis | null;
    descriptiveAnalysis?: DescriptiveAnalysis | null;
    estimatedValues?: EstimatedValues | null;
    pricingRationale?: string | null;
    finalScore?: number | null;
    dataSources: ValuacionDataSourceEntry[];
    versions: ValuacionVersion[];
    deletedAt?: Date | null;
    createdAt?: Date;
    updatedAt?: Date;
  }) {
    this._id = params._id;
    this.userId = params.userId;
    this.sessionId = params.sessionId;
    this.postId = params.postId;
    this.category = params.category;
    this.status = params.status;
    this.mode = params.mode;
    this.title = params.title ?? null;
    this.layer = params.layer;
    this.completionPercent = params.completionPercent;
    this.confidencePercent = params.confidencePercent;
    this.coveredFields = params.coveredFields;
    this.notApplicableFields = params.notApplicableFields ?? [];
    this.briefItems = params.briefItems ?? [];
    this.briefMessages = params.briefMessages;
    this.briefAnswers = params.briefAnswers;
    this.images = params.images;
    this.photoAnalysis = params.photoAnalysis;
    this.descriptiveAnalysis = params.descriptiveAnalysis;
    this.estimatedValues = params.estimatedValues;
    this.pricingRationale = params.pricingRationale ?? null;
    this.finalScore = params.finalScore;
    this.dataSources = params.dataSources;
    this.versions = params.versions;
    this.deletedAt = params.deletedAt;
    this.createdAt = params.createdAt;
    this.updatedAt = params.updatedAt;
  }
}
