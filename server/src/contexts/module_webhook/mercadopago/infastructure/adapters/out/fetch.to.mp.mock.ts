import { randomUUID } from 'crypto';
import { Model } from 'mongoose';

import { MyLoggerService } from 'src/contexts/module_shared/logger/logger.service';
import {
  MP_MOCK_DEFAULT_AMOUNT,
  MP_MOCK_REJECTED_TOKEN,
} from 'src/contexts/module_shared/mp-mock/mp-mock.config';
import { FetchToMpInterface } from '../../../application/adapter/out/fech.to.mp.interface';
import { MercadoPagoApiError } from '../../../application/adapter/out/mercadopago.api.error';

/*
MercadoPago simulado para desarrollo local (ver mp-mock.config.ts). No llama a
MP: arma respuestas con la forma de las de MP.
- Planes (`preapproval_plan/<id>`): salen de la colección `subscriptionplans`
  (precio = `price`, frecuencia según `intervalTime`).
- Suscripciones y pagos: quedan en memoria mientras corre el server (al
  reiniciarse, un preapproval que no está se lee como autorizado).
- El token de tarjeta decide el resultado: `mock_OTHE` rechaza, cualquier otro
  aprueba.
*/
export class MockFetchToMercadoPagoAdapter implements FetchToMpInterface {
  private readonly preapprovals = new Map<string, any>();
  private readonly payments = new Map<string, any>();

  constructor(
    private readonly planModel: Model<any>,
    private readonly logger: MyLoggerService,
  ) {
    this.logger.warn('MercadoPago SIMULADO (MP_MOCK=true): no se cobra nada.');
  }

  async getDataFromMp_fetch(url: string): Promise<any> {
    const planId = this.idAfter(url, 'preapproval_plan/');
    if (planId) return this.planFor(planId);
    const preapprovalId = this.idAfter(url, 'preapproval/');
    if (preapprovalId) {
      return (
        this.preapprovals.get(preapprovalId) ?? {
          id: preapprovalId,
          status: 'authorized',
          auto_recurring: { start_date: new Date().toISOString(), frequency: 1, frequency_type: 'months' },
        }
      );
    }
    const paymentId = this.idAfter(url, 'payments/');
    if (paymentId && this.payments.has(paymentId)) return this.payments.get(paymentId);
    throw new MercadoPagoApiError(404, { message: `Simulado: no existe ${url}` });
  }

  async changeSubscriptionStatusInMercadopago_fetch(
    _url: string,
    preapprovalId: string,
    action: string,
  ): Promise<any> {
    return this.updatePreapproval(preapprovalId, { status: action });
  }

  async createPreapproval(body: Record<string, any>): Promise<any> {
    if (body.card_token_id === MP_MOCK_REJECTED_TOKEN) {
      throw new MercadoPagoApiError(400, { message: 'cc_rejected_other_reason (simulado)' });
    }
    const now = new Date();
    const nextPayment = new Date(now);
    nextPayment.setMonth(nextPayment.getMonth() + 1);
    const recurring = body.auto_recurring ?? {};
    const preapproval = {
      id: `mock_pre_${randomUUID().replace(/-/g, '').slice(0, 20)}`,
      status: 'authorized',
      payer_id: 999999,
      payer_email: body.payer_email,
      preapproval_plan_id: body.preapproval_plan_id ?? null,
      external_reference: body.external_reference,
      reason: body.reason,
      date_created: now.toISOString(),
      next_payment_date: nextPayment.toISOString(),
      payment_method_id: 'visa',
      auto_recurring: {
        frequency: recurring.frequency ?? 1,
        frequency_type: recurring.frequency_type ?? 'months',
        transaction_amount: recurring.transaction_amount,
        currency_id: recurring.currency_id ?? 'ARS',
        start_date: now.toISOString(),
      },
    };
    this.preapprovals.set(preapproval.id, preapproval);
    this.logger.log(`[MP simulado] preapproval ${preapproval.id} por $${recurring.transaction_amount}`);
    return preapproval;
  }

  async updatePreapproval(preapprovalId: string, body: Record<string, any>): Promise<any> {
    const current = this.preapprovals.get(preapprovalId) ?? { id: preapprovalId, status: 'authorized' };
    const status = body.status === 'canceled' ? 'cancelled' : body.status;
    const updated = { ...current, ...(status ? { status } : {}) };
    this.preapprovals.set(preapprovalId, updated);
    this.logger.log(`[MP simulado] preapproval ${preapprovalId} -> ${updated.status}`);
    return updated;
  }

  async createPayment(body: Record<string, any>, _idempotencyKey: string): Promise<any> {
    const rejected = body.token === MP_MOCK_REJECTED_TOKEN;
    const payment = {
      id: Date.now(),
      status: rejected ? 'rejected' : 'approved',
      status_detail: rejected ? 'cc_rejected_other_reason' : 'accredited',
      transaction_amount: body.transaction_amount,
      currency_id: 'ARS',
      description: body.description,
      external_reference: body.external_reference,
      date_created: new Date().toISOString(),
      payment_method_id: body.payment_method_id ?? 'visa',
    };
    this.payments.set(String(payment.id), payment);
    this.logger.log(`[MP simulado] pago ${payment.id} ${payment.status} por $${payment.transaction_amount}`);
    return payment;
  }

  private idAfter(url: string, marker: string): string | null {
    const index = url.indexOf(marker);
    if (index < 0) return null;
    const id = url.slice(index + marker.length).split(/[?/]/)[0];
    return id || null;
  }

  private async planFor(mpPreapprovalPlanId: string): Promise<any> {
    const plan = await this.planModel.findOne({ mpPreapprovalPlanId }).lean<any>();
    if (!plan) throw new MercadoPagoApiError(404, { message: 'Simulado: el plan no existe' });
    const months = Math.max(1, Math.round((Number(plan.intervalTime) || 30) / 30));
    const amount = Number(plan.price) > 0 ? Number(plan.price) : MP_MOCK_DEFAULT_AMOUNT;
    return {
      id: mpPreapprovalPlanId,
      status: plan.isActive === false ? 'cancelled' : 'active',
      reason: plan.reason,
      auto_recurring: {
        frequency: months,
        frequency_type: 'months',
        transaction_amount: amount,
        currency_id: 'ARS',
      },
    };
  }
}
