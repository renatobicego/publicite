import { Document, Schema } from 'mongoose';

/**
 * Cuenta de consumo de tokens por owner y período.
 * El "reset" mensual/diario es implícito: cada período usa su propio documento,
 * así que al empezar un período nuevo el consumo arranca de cero sin jobs.
 * La cuota (allowance) NO se persiste: se calcula siempre desde planes + env.
 */
export interface ChatbotTokenAccountDocument extends Document {
  ownerType: string;
  ownerId: string;
  period: string;
  usedRealTokens: number;
  requestCount: number;
  lastUsedAt: Date;
}

export const ChatbotTokenAccountSchema = new Schema(
  {
    ownerType: { type: String, required: true, enum: ['user', 'anonymous'] },
    ownerId: { type: String, required: true },
    period: { type: String, required: true },
    usedRealTokens: { type: Number, required: true, default: 0 },
    requestCount: { type: Number, required: true, default: 0 },
    lastUsedAt: { type: Date },
  },
  { timestamps: true },
);

ChatbotTokenAccountSchema.index(
  { ownerType: 1, ownerId: 1, period: 1 },
  { unique: true },
);

/**
 * Bolsa comunitaria de tokens de la plataforma (documento único, key: 'main').
 * Se acredita con el share interno de los planes pagos y se debita con el
 * consumo de usuarios free y anónimos. Si el saldo llega a 0, los usuarios
 * sin plan pago no pueden usar la IA.
 */
export interface ChatbotCommunityPoolDocument extends Document {
  key: string;
  balanceRealTokens: number;
  totalAccruedRealTokens: number;
  totalConsumedRealTokens: number;
  lastAccrualPeriod?: string;
}

export const ChatbotCommunityPoolSchema = new Schema(
  {
    key: { type: String, required: true, unique: true },
    balanceRealTokens: { type: Number, required: true, default: 0 },
    totalAccruedRealTokens: { type: Number, required: true, default: 0 },
    totalConsumedRealTokens: { type: Number, required: true, default: 0 },
    lastAccrualPeriod: { type: String },
  },
  { timestamps: true },
);

/**
 * Auditoría e idempotencia de la acreditación mensual de la bolsa comunitaria:
 * el índice único sobre period garantiza que cada mes se acredita una sola vez
 * aunque compitan varias instancias serverless.
 */
export interface ChatbotTokenAccrualDocument extends Document {
  period: string;
  realTokens: number;
  paidSubscriptionsCount: number;
  completed: boolean;
}

export const ChatbotTokenAccrualSchema = new Schema(
  {
    period: { type: String, required: true, unique: true },
    realTokens: { type: Number, required: true, default: 0 },
    paidSubscriptionsCount: { type: Number, required: true, default: 0 },
    completed: { type: Boolean, required: true, default: false },
  },
  { timestamps: true },
);

/**
 * Log de consumo por request a OpenAI: permite trackear cuántos tokens usa
 * cada usuario, por canal (web/WhatsApp) y por tipo (chat/imagen/valuación/match).
 *
 * OJO con `kind`: el enum tiene que incluir todos los valores de AiUsageKind.
 * Si falta uno, Mongoose rechaza el documento y —como recordUsage() traga los
 * errores para no romperle la respuesta al usuario— el consumo se pierde en
 * silencio: la IA se usa pero no se descuenta de ninguna cuota.
 */
export interface ChatbotUsageLogDocument extends Document {
  ownerType: string;
  ownerId: string;
  sessionId?: string;
  channel: string;
  kind: string;
  /** Nombre "aiModel" para no colisionar con Document.model de Mongoose. */
  aiModel: string;
  promptTokens: number;
  completionTokens: number;
  totalRealTokens: number;
  rawTotalTokens: number;
  costMultiplier: number;
  chargedTo: string;
}

export const ChatbotUsageLogSchema = new Schema(
  {
    ownerType: { type: String, required: true, enum: ['user', 'anonymous'] },
    ownerId: { type: String, required: true },
    sessionId: { type: String },
    channel: { type: String, required: true, enum: ['web', 'whatsapp'] },
    kind: {
      type: String,
      required: true,
      enum: ['chat', 'image', 'valuacion', 'match'],
    },
    aiModel: { type: String, required: true },
    promptTokens: { type: Number, required: true, default: 0 },
    completionTokens: { type: Number, required: true, default: 0 },
    // Lo que se descontó de la cuota (ya ponderado por el costo del modelo).
    totalRealTokens: { type: Number, required: true, default: 0 },
    // Lo que OpenAI informó realmente, para auditar costo vs. cuota consumida.
    rawTotalTokens: { type: Number, required: true, default: 0 },
    costMultiplier: { type: Number, required: true, default: 1 },
    chargedTo: { type: String, required: true, enum: ['plan', 'community'] },
  },
  { timestamps: true },
);

ChatbotUsageLogSchema.index({ ownerId: 1, createdAt: -1 });
ChatbotUsageLogSchema.index({ createdAt: -1 });
