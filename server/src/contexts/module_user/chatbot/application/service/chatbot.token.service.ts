import { Inject, Injectable } from '@nestjs/common';

import { ChatbotTokenServiceInterface } from '../../domain/service/chatbot.token.service.interface';
import { ChatbotTokenRepositoryInterface } from '../../domain/repository/chatbot.token.repository.interface';
import {
  AiUsage,
  AiUsageKind,
  TokenBlockedReason,
  TokenConsumer,
  TokenConsumerBucket,
  TokenGateResult,
  UsageMeta,
} from '../../domain/entity/chatbot.token.types';
import {
  ChatbotTokenStatusResponse,
  ChatbotUsageReportResponse,
} from '../dto/HTTP-RESPONSE/chatbot.token.response';
import {
  getAnonDailyPubliciteTokens,
  getCommunityMonthlyBonusPubliciteTokens,
  getCommunitySeedPubliciteTokens,
  getFreeMonthlyPubliciteTokens,
  getModelCostMultiplier,
  getPlanCommunityPubliciteTokens,
  getPlanNetPubliciteTokens,
  publiciteToRealTokens,
  realToPubliciteTokens,
} from 'src/contexts/module_shared/chatbot-tokens/chatbot.tokens.config';
import { MyLoggerService } from 'src/contexts/module_shared/logger/logger.service';

const MONGO_ID_REGEX = /^[a-f\d]{24}$/i;

@Injectable()
export class ChatbotTokenService implements ChatbotTokenServiceInterface {
  /** Cache por instancia para no consultar la acreditación mensual en cada request. */
  private accrualCheckedPeriod: string | null = null;
  /** Cache por instancia del último objetivo de base (seed) ya verificado. */
  private seedCheckedTarget: number | null = null;

  constructor(
    @Inject('ChatbotTokenRepositoryInterface')
    private readonly tokenRepository: ChatbotTokenRepositoryInterface,
    private readonly logger: MyLoggerService,
  ) {}

  async resolveAndCheck(
    userId: string | undefined,
    sessionId: string | undefined,
  ): Promise<TokenGateResult> {
    const consumer = await this.resolveConsumer(userId, sessionId);
    const usedRealTokens = await this.tokenRepository.getUsedRealTokens(
      consumer.ownerType,
      consumer.ownerId,
      consumer.period,
    );
    const remainingRealTokens = consumer.allowanceRealTokens - usedRealTokens;

    const gate: TokenGateResult = {
      allowed: remainingRealTokens > 0,
      consumer,
      usedRealTokens,
      remainingRealTokens: Math.max(0, remainingRealTokens),
    };

    if (!gate.allowed) {
      gate.blockedReason = this.exhaustedReasonFor(consumer.bucket);
    }

    // Los buckets sin plan pago consumen de la bolsa comunitaria: además de su
    // límite individual, necesitan que la plataforma tenga saldo comunitario.
    if (consumer.bucket !== TokenConsumerBucket.PLAN) {
      await this.ensureCommunitySeed();
      await this.ensureMonthlyCommunityAccrual();
      const communityBalance = await this.tokenRepository.getCommunityBalance();
      gate.communityBalanceRealTokens = communityBalance;
      if (gate.allowed && communityBalance <= 0) {
        gate.allowed = false;
        gate.blockedReason = TokenBlockedReason.COMMUNITY_EMPTY;
      }
    }

    return gate;
  }

  async recordUsage(
    gate: TokenGateResult,
    usage: AiUsage,
    meta: UsageMeta,
  ): Promise<number> {
    // El cobro se calcula fuera del try: aunque falle la persistencia, quien
    // llama necesita saber cuánto se consumió para informar el estado al front.
    const rawTotalTokens = Math.max(
      0,
      Math.round(usage.totalTokens || usage.promptTokens + usage.completionTokens),
    );
    const costMultiplier = getModelCostMultiplier(meta.model);
    const totalRealTokens = Math.round(rawTotalTokens * costMultiplier);

    if (totalRealTokens === 0) return 0;

    // Nunca romper la respuesta al usuario por un fallo de contabilidad:
    // la llamada a OpenAI ya se hizo y se pagó.
    try {
      const { consumer } = gate;
      await this.tokenRepository.addUsage(
        consumer.ownerType,
        consumer.ownerId,
        consumer.period,
        totalRealTokens,
      );

      const chargedTo =
        consumer.bucket === TokenConsumerBucket.PLAN ? 'plan' : 'community';
      if (chargedTo === 'community') {
        await this.tokenRepository.consumeCommunityTokens(totalRealTokens);
      }

      await this.tokenRepository.logUsage({
        ownerType: consumer.ownerType,
        ownerId: consumer.ownerId,
        sessionId: meta.sessionId,
        channel: meta.channel,
        kind: meta.kind,
        model: meta.model,
        promptTokens: Math.round(usage.promptTokens || 0),
        completionTokens: Math.round(usage.completionTokens || 0),
        totalRealTokens,
        rawTotalTokens,
        costMultiplier,
        chargedTo,
      });
    } catch (error: any) {
      this.logger.error(
        'Error registrando consumo de tokens del chatbot: ' + error.message,
      );
    }

    return totalRealTokens;
  }

  async chargeAndBuildStatus(
    gate: TokenGateResult,
    usage: AiUsage | undefined,
    meta: { sessionId?: string; kind: AiUsageKind; model: string },
  ): Promise<ChatbotTokenStatusResponse> {
    const effectiveUsage: AiUsage = usage ?? {
      promptTokens: 0,
      completionTokens: 0,
      totalTokens: 0,
    };

    const chargedRealTokens = await this.recordUsage(gate, effectiveUsage, {
      sessionId: meta.sessionId,
      channel: meta.sessionId?.startsWith('whatsapp:') ? 'whatsapp' : 'web',
      kind: meta.kind,
      model: meta.model,
    });

    const usedAfter = gate.usedRealTokens + chargedRealTokens;
    return this.buildStatusFromGate({
      ...gate,
      usedRealTokens: usedAfter,
      remainingRealTokens: Math.max(
        0,
        gate.consumer.allowanceRealTokens - usedAfter,
      ),
    });
  }

  async getStatusForUser(userId: string): Promise<ChatbotTokenStatusResponse> {
    const gate = await this.resolveAndCheck(userId, undefined);
    return this.buildStatusFromGate(gate);
  }

  buildStatusFromGate(gate: TokenGateResult): ChatbotTokenStatusResponse {
    const { consumer } = gate;
    const isPlan = consumer.bucket === TokenConsumerBucket.PLAN;
    return {
      hasActivePaidPlan: isPlan,
      source: consumer.bucket,
      allowance: realToPubliciteTokens(consumer.allowanceRealTokens),
      used: realToPubliciteTokens(gate.usedRealTokens),
      remaining: realToPubliciteTokens(gate.remainingRealTokens),
      communityTokensAvailable: isPlan
        ? true
        : (gate.communityBalanceRealTokens ?? 0) > 0,
      resetsAt: this.periodResetDate(consumer),
    };
  }

  async getUsageReport(
    chargedTo: string | undefined,
    limit: number,
  ): Promise<ChatbotUsageReportResponse> {
    // Mantener la bolsa al día aunque nadie haya chateado todavía.
    await this.ensureCommunitySeed();
    await this.ensureMonthlyCommunityAccrual();

    const pool = await this.tokenRepository.getCommunityPoolSnapshot();
    const consumers = await this.tokenRepository.aggregateUsageByOwner(
      chargedTo,
      Math.min(Math.max(Math.floor(limit) || 50, 1), 500),
    );

    return {
      poolBalance: realToPubliciteTokens(pool.balanceRealTokens),
      poolTotalAccrued: realToPubliciteTokens(pool.totalAccruedRealTokens),
      poolTotalConsumed: realToPubliciteTokens(pool.totalConsumedRealTokens),
      consumers: consumers.map((consumer) => ({
        ownerId: consumer.ownerId,
        ownerType: consumer.ownerType,
        username: consumer.username,
        email: consumer.email,
        publiciteTokensUsed: realToPubliciteTokens(consumer.totalRealTokens),
        requestCount: consumer.requestCount,
        lastUsedAt: consumer.lastUsedAt,
        channels: consumer.channels ?? [],
      })),
    };
  }

  buildLimitMessage(gate: TokenGateResult): string {
    const resetDate = this.formatDate(this.periodResetDate(gate.consumer));
    switch (gate.blockedReason) {
      case TokenBlockedReason.PLAN_EXHAUSTED:
        return (
          `Te quedaste sin tokens Publicité este mes 😅. ` +
          `Tu cuota se renueva el ${resetDate} con el próximo período de tu plan.`
        );
      case TokenBlockedReason.FREE_EXHAUSTED:
        return (
          `Alcanzaste el límite gratuito de este mes 😅. ` +
          `Suscribite a un plan de Publicité para seguir chateando conmigo 🚀`
        );
      case TokenBlockedReason.ANON_EXHAUSTED:
        return (
          `Alcanzaste el límite diario de consultas gratis 😅. ` +
          `Podés volver mañana, o registrarte y suscribirte a un plan de Publicité para chatear sin esperas 🚀`
        );
      case TokenBlockedReason.COMMUNITY_EMPTY:
        return (
          `Por ahora no quedan tokens comunitarios disponibles en Publicite 😔. ` +
          `Suscribite a un plan para usar el asistente con tu propia cuota de tokens 🚀`
        );
      case TokenBlockedReason.IDENTITY_REQUIRED:
        return 'Iniciá sesión para poder usar esta función de IA.';
      default:
        return 'No es posible usar el asistente de IA en este momento.';
    }
  }

  /**
   * Determina el bucket del consumidor:
   * - mongoId de usuario existente con plan pago con tokens → PLAN (cuota mensual propia).
   * - mongoId de usuario existente sin plan pago → FREE (cuota mensual comunitaria).
   * - cualquier otra identidad (uuid de sesión, whatsapp:<tel>) → ANONYMOUS (cuota diaria comunitaria).
   */
  private async resolveConsumer(
    userId: string | undefined,
    sessionId: string | undefined,
  ): Promise<TokenConsumer> {
    if (userId && MONGO_ID_REGEX.test(userId)) {
      const plans = await this.tokenRepository.getUserAuthorizedPlans(userId);
      if (plans !== null) {
        const netPubliciteTokens = plans.reduce(
          (total, plan) => total + getPlanNetPubliciteTokens(plan),
          0,
        );
        if (netPubliciteTokens > 0) {
          return {
            ownerType: 'user',
            ownerId: userId,
            bucket: TokenConsumerBucket.PLAN,
            period: this.monthPeriod(),
            allowanceRealTokens: publiciteToRealTokens(netPubliciteTokens),
          };
        }
        return {
          ownerType: 'user',
          ownerId: userId,
          bucket: TokenConsumerBucket.FREE,
          period: this.monthPeriod(),
          allowanceRealTokens: publiciteToRealTokens(
            getFreeMonthlyPubliciteTokens(),
          ),
        };
      }
    }

    return {
      ownerType: 'anonymous',
      ownerId: userId || sessionId || 'anonimo',
      bucket: TokenConsumerBucket.ANONYMOUS,
      period: this.dayPeriod(),
      allowanceRealTokens: publiciteToRealTokens(getAnonDailyPubliciteTokens()),
    };
  }

  /**
   * Base de la plataforma (CHATBOT_TOKENS_COMMUNITY_SEED): acredita a la bolsa
   * la diferencia entre el objetivo del env y lo ya acreditado. Permite cargar
   * el crédito comprado en OpenAI ("los 50 USD") y ampliarlo subiendo el env.
   */
  private async ensureCommunitySeed(): Promise<void> {
    const targetPublicite = getCommunitySeedPubliciteTokens();
    if (targetPublicite <= 0 || this.seedCheckedTarget === targetPublicite) {
      return;
    }
    try {
      const delta = await this.tokenRepository.raiseSeedAccrual(
        publiciteToRealTokens(targetPublicite),
      );
      if (delta > 0) {
        this.logger.log(
          `Base comunitaria (seed) acreditada: +${realToPubliciteTokens(delta)} tokens Publicité (objetivo ${targetPublicite})`,
        );
      }
      this.seedCheckedTarget = targetPublicite;
    } catch (error: any) {
      this.logger.error(
        'Error acreditando la base comunitaria (seed): ' + error.message,
      );
    }
  }

  /**
   * Acreditación mensual (lazy) de la bolsa comunitaria: la primera request del
   * mes suma el share comunitario de todas las suscripciones pagas activas.
   * No depende de webhooks de MercadoPago: si el usuario sigue `authorized`,
   * su aporte del mes entra a la bolsa. Idempotente por índice único de período.
   */
  private async ensureMonthlyCommunityAccrual(): Promise<void> {
    const period = this.monthPeriod();
    if (this.accrualCheckedPeriod === period) return;

    try {
      if (await this.tokenRepository.hasAccrualForPeriod(period)) {
        this.accrualCheckedPeriod = period;
        return;
      }

      const won = await this.tokenRepository.tryCreateAccrual(period);
      if (won) {
        const plans = await this.tokenRepository.getAllAuthorizedPlans();
        const paidPlans = plans.filter((plan) => !plan.isFree);
        const communityPubliciteTokens =
          paidPlans.reduce(
            (total, plan) => total + getPlanCommunityPubliciteTokens(plan),
            0,
          ) + getCommunityMonthlyBonusPubliciteTokens();
        const realTokens = publiciteToRealTokens(communityPubliciteTokens);
        await this.tokenRepository.finalizeAccrual(
          period,
          realTokens,
          paidPlans.length,
        );
        this.logger.log(
          `Bolsa comunitaria acreditada para ${period}: ${communityPubliciteTokens} tokens Publicité (${paidPlans.length} suscripciones pagas)`,
        );
      }
      this.accrualCheckedPeriod = period;
    } catch (error: any) {
      // No bloquear el chat por un fallo de acreditación; se reintenta en la próxima request.
      this.logger.error(
        'Error en la acreditación mensual de tokens comunitarios: ' + error.message,
      );
    }
  }

  private exhaustedReasonFor(bucket: TokenConsumerBucket): TokenBlockedReason {
    switch (bucket) {
      case TokenConsumerBucket.PLAN:
        return TokenBlockedReason.PLAN_EXHAUSTED;
      case TokenConsumerBucket.FREE:
        return TokenBlockedReason.FREE_EXHAUSTED;
      default:
        return TokenBlockedReason.ANON_EXHAUSTED;
    }
  }

  /** Períodos en UTC: 'YYYY-MM' para cuotas mensuales, 'YYYY-MM-DD' para diarias. */
  private monthPeriod(date: Date = new Date()): string {
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
  }

  private dayPeriod(date: Date = new Date()): string {
    const day = String(date.getUTCDate()).padStart(2, '0');
    return `${this.monthPeriod(date)}-${day}`;
  }

  private periodResetDate(consumer: TokenConsumer): Date {
    const now = new Date();
    if (consumer.bucket === TokenConsumerBucket.ANONYMOUS) {
      return new Date(
        Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1),
      );
    }
    return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1));
  }

  private formatDate(date: Date): string {
    return date.toLocaleDateString('es-AR', {
      day: 'numeric',
      month: 'long',
      timeZone: 'UTC',
    });
  }
}
