// ============================================================
// Types for Valuación IA + Match IA Workspace
// ============================================================

export type ValuacionCategory = "imagen" | "objeto" | "servicio" | "bien" | "otro";

export type ValuacionStatus = "draft" | "processing" | "completed" | "saved" | "archived";

export type CubitoMode =
  | "general"
  | "disenador_grafico"
  | "marketing"
  | "especialista_negocios"
  | "branch"
  | "cliente_b2b"
  | "consultor_ventas"
  | "analista_mercado"
  | "entrenamiento_publicitario";

export type WorkspaceModule = "idle" | "valuacion" | "match";

// --- Valuación ---

export interface ValuacionScores {
  estado: number;
  marca: number;
  mercado: number;
  rareza: number;
}

export interface DescriptiveScores {
  uso: number;
  vidaUtil: number;
  mantenimiento: number;
  documentacion: number;
}

export interface PhotoAnalysis {
  description: string;
  brand: string | null;
  model: string | null;
  condition: string;
  components: string[];
  damages: string[];
  confidence: number;
  scores: ValuacionScores;
}

export interface DescriptiveAnalysis {
  summary: string;
  confidence: number;
  scores: DescriptiveScores;
  /** Etiquetas contextuales de los 4 ejes (null en valuaciones viejas). */
  axisLabels?: {
    uso: string;
    vidaUtil: string;
    mantenimiento: string;
    documentacion: string;
  } | null;
}

export interface EstimatedValues {
  liquidacion: number | null;
  mercado: number | null;
  premium: number | null;
  currency: string;
}

export type BriefItemStatus = "pendiente" | "cubierto" | "no_aplica" | "omitido";

/** Ítem del checklist dinámico del brief (lo arma la IA según qué se valúa). */
export interface BriefItem {
  key: string;
  label: string;
  status: BriefItemStatus;
}

export interface DataSource {
  field: string;
  source: "fotografica" | "descriptiva" | "inferencia_ia";
}

export interface TokenStatus {
  hasActivePaidPlan: boolean;
  source: string;
  allowance: number;
  used: number;
  remaining: number;
  communityTokensAvailable: number;
  resetsAt: string;
}

export interface ValuacionResult {
  id: string;
  status: ValuacionStatus;
  category: ValuacionCategory;
  title?: string | null;
  layer: 1 | 2 | 3;
  completionPercent: number;
  confidencePercent: number;
  finalScore: number;
  photoAnalysis: PhotoAnalysis | null;
  descriptiveAnalysis: DescriptiveAnalysis;
  estimatedValues: EstimatedValues | null;
  pricingRationale?: string | null;
  dataSources: DataSource[];
  versionsCount: number;
  coveredFields: string[];
  images: { url: string }[];
  postId: string | null;
  createdAt: string;
  tokenStatus: TokenStatus | null;
}

export interface ValuacionMessageResponse {
  reply: string;
  briefComplete: boolean;
  limitReached: boolean;
  valuacion: {
    id: string;
    status: ValuacionStatus;
    layer: 1 | 2 | 3;
    completionPercent: number;
    title?: string | null;
    coveredFields: string[];
    briefItems: BriefItem[];
    images: { url: string }[];
    tokenStatus: TokenStatus | null;
  };
}

export interface ValuacionListItem {
  id: string;
  title?: string | null;
  category: ValuacionCategory;
  status: ValuacionStatus;
  layer: 1 | 2 | 3;
  finalScore: number | null;
  createdAt: string;
  estimatedValues: { mercado: number | null } | null;
}

// --- Match ---

export interface MatchedPost {
  postId: string;
  title: string;
  description: string | null;
  price: number;
  imageUrl: string | null;
  postType: string;
  relevanceScore: number;
  matchReason: string;
}

export interface MatchResponse {
  matches: MatchedPost[];
  interpretation: string;
  candidatesEvaluated: number;
  limitReached: boolean;
  message: string | null;
  tokenStatus: TokenStatus | null;
}

// --- Post Draft from Valuación ---

export interface ValuacionPostDraft {
  title: string;
  description: string;
  suggestedPrice: number | null;
  imageUrls: string[];
  brand: string | null;
  modelType: string | null;
  condition: string | null;
  valuacionId: string;
}

// --- Workspace State ---

export interface ReferenceImage {
  id: string;
  url: string;
  file?: File;
  uploadedAt: Date;
}

export interface WorkspaceMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}
