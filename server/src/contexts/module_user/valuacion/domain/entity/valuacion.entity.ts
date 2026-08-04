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
  readonly layer: number;
  readonly completionPercent: number;
  readonly confidencePercent: number;
  readonly coveredFields: ValuacionBriefField[];
  readonly briefMessages: ValuacionBriefMessage[];
  readonly briefAnswers: ValuacionBriefAnswer[];
  readonly images: ValuacionImage[];
  readonly photoAnalysis?: PhotoAnalysis | null;
  readonly descriptiveAnalysis?: DescriptiveAnalysis | null;
  readonly estimatedValues?: EstimatedValues | null;
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
    layer: number;
    completionPercent: number;
    confidencePercent: number;
    coveredFields: ValuacionBriefField[];
    briefMessages: ValuacionBriefMessage[];
    briefAnswers: ValuacionBriefAnswer[];
    images: ValuacionImage[];
    photoAnalysis?: PhotoAnalysis | null;
    descriptiveAnalysis?: DescriptiveAnalysis | null;
    estimatedValues?: EstimatedValues | null;
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
    this.layer = params.layer;
    this.completionPercent = params.completionPercent;
    this.confidencePercent = params.confidencePercent;
    this.coveredFields = params.coveredFields;
    this.briefMessages = params.briefMessages;
    this.briefAnswers = params.briefAnswers;
    this.images = params.images;
    this.photoAnalysis = params.photoAnalysis;
    this.descriptiveAnalysis = params.descriptiveAnalysis;
    this.estimatedValues = params.estimatedValues;
    this.finalScore = params.finalScore;
    this.dataSources = params.dataSources;
    this.versions = params.versions;
    this.deletedAt = params.deletedAt;
    this.createdAt = params.createdAt;
    this.updatedAt = params.updatedAt;
  }
}
