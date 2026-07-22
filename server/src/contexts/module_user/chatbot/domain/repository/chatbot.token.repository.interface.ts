import { PlanTokenRef } from 'src/contexts/module_shared/chatbot-tokens/chatbot.tokens.config';
import {
  CommunityPoolSnapshot,
  UsageByOwner,
  UsageLogEntry,
} from '../entity/chatbot.token.types';

export interface ChatbotTokenRepositoryInterface {
  /**
   * Planes (docs planos) de las suscripciones `authorized` del usuario.
   * Devuelve `null` si el usuario no existe (se lo trata como anónimo).
   */
  getUserAuthorizedPlans(userId: string): Promise<PlanTokenRef[] | null>;

  /** Tokens reales consumidos por un owner en un período. */
  getUsedRealTokens(
    ownerType: string,
    ownerId: string,
    period: string,
  ): Promise<number>;

  /** Acumula consumo en la cuenta del período (upsert + $inc atómico). */
  addUsage(
    ownerType: string,
    ownerId: string,
    period: string,
    realTokens: number,
  ): Promise<void>;

  /** Saldo actual de la bolsa comunitaria en tokens reales. */
  getCommunityBalance(): Promise<number>;

  /** Descuenta tokens reales de la bolsa comunitaria ($inc atómico). */
  consumeCommunityTokens(realTokens: number): Promise<void>;

  /** true si la acreditación mensual de la bolsa ya corrió para el período. */
  hasAccrualForPeriod(period: string): Promise<boolean>;

  /**
   * Intenta reservar la acreditación del período (índice único sobre period).
   * Devuelve true si este proceso ganó la carrera y debe completarla.
   */
  tryCreateAccrual(period: string): Promise<boolean>;

  /** Planes (docs planos) de TODAS las suscripciones `authorized` de la plataforma. */
  getAllAuthorizedPlans(): Promise<PlanTokenRef[]>;

  /** Registra el total acreditado y suma el crédito a la bolsa comunitaria. */
  finalizeAccrual(
    period: string,
    realTokens: number,
    paidSubscriptionsCount: number,
  ): Promise<void>;

  /** Log de consumo por request (tracking de cuánto usa cada usuario). */
  logUsage(entry: UsageLogEntry): Promise<void>;

  /**
   * Acredita la base de la plataforma (seed) hasta alcanzar el total objetivo
   * en tokens reales. Idempotente e incremental: devuelve el delta acreditado
   * (0 si ya estaba al día o si otra instancia ganó la carrera).
   */
  raiseSeedAccrual(targetRealTokens: number): Promise<number>;

  /** Estado completo de la bolsa comunitaria. */
  getCommunityPoolSnapshot(): Promise<CommunityPoolSnapshot>;

  /**
   * Consumo agregado por owner desde el log de usage, ordenado por mayor
   * consumo, con username/email si el owner es un usuario registrado.
   */
  aggregateUsageByOwner(
    chargedTo: string | undefined,
    limit: number,
  ): Promise<UsageByOwner[]>;
}
