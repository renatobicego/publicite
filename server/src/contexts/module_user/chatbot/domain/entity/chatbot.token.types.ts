/**
 * Tipos de dominio del sistema de tokens de IA del chatbot.
 * Todas las cantidades internas están en tokens reales de OpenAI (enteros);
 * la conversión a "tokens Publicité" ocurre sólo en la capa de presentación.
 */

/** De qué cuota consume el que chatea. */
export enum TokenConsumerBucket {
  /** Usuario registrado con plan pago activo: consume su cuota mensual personal. */
  PLAN = 'plan',
  /** Usuario registrado sin plan pago: cuota mensual limitada contra la bolsa comunitaria. */
  FREE = 'free',
  /** No registrado (web o WhatsApp): cuota diaria limitada contra la bolsa comunitaria. */
  ANONYMOUS = 'anonymous',
}

export enum TokenBlockedReason {
  PLAN_EXHAUSTED = 'PLAN_EXHAUSTED',
  FREE_EXHAUSTED = 'FREE_EXHAUSTED',
  ANON_EXHAUSTED = 'ANON_EXHAUSTED',
  COMMUNITY_EMPTY = 'COMMUNITY_EMPTY',
  IDENTITY_REQUIRED = 'IDENTITY_REQUIRED',
}

export interface TokenConsumer {
  ownerType: 'user' | 'anonymous';
  /** mongoId del usuario, o identificador anónimo (sessionId web / whatsapp:<tel>). */
  ownerId: string;
  bucket: TokenConsumerBucket;
  /** Período de la cuota: 'YYYY-MM' (plan/free) o 'YYYY-MM-DD' (anónimos), en UTC. */
  period: string;
  allowanceRealTokens: number;
}

export interface TokenGateResult {
  allowed: boolean;
  consumer: TokenConsumer;
  usedRealTokens: number;
  remainingRealTokens: number;
  /** Sólo para buckets que consumen de la bolsa comunitaria. */
  communityBalanceRealTokens?: number;
  blockedReason?: TokenBlockedReason;
}

/** Usage informado por OpenAI para una request. */
export interface AiUsage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
}

export interface UsageMeta {
  sessionId?: string;
  channel: 'web' | 'whatsapp';
  kind: 'chat' | 'image';
  model: string;
}

export interface UsageLogEntry extends UsageMeta {
  ownerType: 'user' | 'anonymous';
  ownerId: string;
  promptTokens: number;
  completionTokens: number;
  totalRealTokens: number;
  chargedTo: 'plan' | 'community';
}

export interface CommunityPoolSnapshot {
  balanceRealTokens: number;
  totalAccruedRealTokens: number;
  totalConsumedRealTokens: number;
}

/** Consumo agregado de un owner (para el reporte de uso). */
export interface UsageByOwner {
  ownerId: string;
  ownerType: string;
  username?: string;
  email?: string;
  totalRealTokens: number;
  requestCount: number;
  lastUsedAt: Date;
  channels: string[];
}
