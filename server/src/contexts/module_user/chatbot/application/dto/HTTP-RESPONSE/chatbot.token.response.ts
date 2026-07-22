import { Field, Float, Int, ObjectType } from '@nestjs/graphql';

/**
 * Estado de tokens de IA de quien consulta, en tokens Publicité (unidad visible).
 * Nunca expone el split interno ni el saldo de la bolsa comunitaria: para los
 * usuarios sin plan sólo se informa si hay disponibilidad comunitaria o no.
 */
@ObjectType()
export class ChatbotTokenStatusResponse {
  @Field(() => Boolean, {
    description: 'true si el usuario tiene un plan pago activo con tokens de IA',
  })
  hasActivePaidPlan: boolean;

  @Field(() => String, {
    description: "Origen de la cuota: 'plan' | 'free' | 'anonymous'",
  })
  source: string;

  @Field(() => Float, {
    description: 'Cuota de tokens Publicité del período (mensual, o diaria para anónimos)',
  })
  allowance: number;

  @Field(() => Float, { description: 'Tokens Publicité consumidos en el período' })
  used: number;

  @Field(() => Float, { description: 'Tokens Publicité restantes en el período' })
  remaining: number;

  @Field(() => Boolean, {
    description:
      'Para usuarios sin plan: si la plataforma tiene tokens comunitarios disponibles',
  })
  communityTokensAvailable: boolean;

  @Field(() => Date, { description: 'Cuándo se reinicia la cuota del período' })
  resetsAt: Date;
}

/** Consumo agregado de un usuario/anónimo, en tokens Publicité. */
@ObjectType()
export class ChatbotUsageConsumerResponse {
  @Field(() => String, {
    description: 'mongoId del usuario, o identificador anónimo (sessionId / whatsapp:<tel>)',
  })
  ownerId: string;

  @Field(() => String, { description: "'user' | 'anonymous'" })
  ownerType: string;

  @Field(() => String, { nullable: true })
  username?: string;

  @Field(() => String, { nullable: true })
  email?: string;

  @Field(() => Float, { description: 'Tokens Publicité consumidos (total histórico)' })
  publiciteTokensUsed: number;

  @Field(() => Int)
  requestCount: number;

  @Field(() => Date)
  lastUsedAt: Date;

  @Field(() => [String], { description: "Canales usados: 'web' y/o 'whatsapp'" })
  channels: string[];
}

/**
 * Reporte de consumo de tokens de IA (protegido por CHATBOT_USAGE_REPORT_KEY).
 * Todo en tokens Publicité.
 */
@ObjectType()
export class ChatbotUsageReportResponse {
  @Field(() => Float, { description: 'Saldo actual de la bolsa comunitaria' })
  poolBalance: number;

  @Field(() => Float, {
    description: 'Total histórico acreditado a la bolsa (base + share de planes + bonus)',
  })
  poolTotalAccrued: number;

  @Field(() => Float, { description: 'Total histórico consumido de la bolsa' })
  poolTotalConsumed: number;

  @Field(() => [ChatbotUsageConsumerResponse], {
    description: 'Consumidores ordenados por mayor consumo',
  })
  consumers: ChatbotUsageConsumerResponse[];
}
