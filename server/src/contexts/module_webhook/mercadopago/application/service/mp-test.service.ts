import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'crypto';

import { MyLoggerService } from 'src/contexts/module_shared/logger/logger.service';
import { EXTERNAL_REFERENCE_PREFIX } from 'src/contexts/module_shared/subscriptions/external-reference';
import { FetchToMpInterface } from '../adapter/out/fech.to.mp.interface';
import { MercadoPagoApiError } from '../adapter/out/mercadopago.api.error';
import { MpTestEventRepositoryInterface } from '../../infastructure/repository/mptest-event.repository';

const PREAPPROVAL_URL = 'https://api.mercadopago.com/preapproval/';
/** Tope de las pruebas: son cobros reales en producción. */
const MAX_TEST_AMOUNT = 5000;

export interface MpTestPaymentCommand {
  amount: number;
  cardTokenId: string;
  payerEmail: string;
  paymentMethodId: string;
  issuerId?: string | null;
  identificationType?: string | null;
  identificationNumber?: string | null;
}

/*
Herramienta de la Fase 0 (panel admin, /admin/prueba-mp): prueba contra MP la
suscripción SIN plan asociado (la que usa Hacete Amigo) y el pago único (el de
los regalos). Todo lleva `external_reference` `mptest:<uuid>`, así el webhook lo
guarda en `mptestevents` sin tocar usuarios ni límites. Devuelve las respuestas
crudas de MP (también los errores): ver exactamente qué contesta es la idea.
Se borra cuando terminen las pruebas.
*/
@Injectable()
export class MpTestService {
  constructor(
    @Inject('FetchToMpInterface')
    private readonly fetchToMp: FetchToMpInterface,
    @Inject('MpTestEventRepositoryInterface')
    private readonly events: MpTestEventRepositoryInterface,
    private readonly configService: ConfigService,
    private readonly logger: MyLoggerService,
  ) {}

  async createPreapproval(amount: number, cardTokenId: string, payerEmail: string): Promise<string> {
    this.assertAmount(amount);
    const externalReference = `${EXTERNAL_REFERENCE_PREFIX.TEST}${randomUUID()}`;
    return this.run(() =>
      this.fetchToMp.createPreapproval({
        reason: 'Prueba de Soon Publicité (admin)',
        external_reference: externalReference,
        payer_email: payerEmail,
        card_token_id: cardTokenId,
        auto_recurring: {
          frequency: 1,
          frequency_type: 'months',
          transaction_amount: amount,
          currency_id: 'ARS',
        },
        back_url: `${this.clientUrl()}/admin/prueba-mp`,
        status: 'authorized',
      }),
    );
  }

  async getPreapproval(preapprovalId: string): Promise<string> {
    return this.run(() => this.getTestPreapproval(preapprovalId));
  }

  /** Pausar (paused), reactivar (authorized) o cancelar (cancelled / canceled). */
  async setPreapprovalStatus(preapprovalId: string, status: string): Promise<string> {
    if (!['paused', 'authorized', 'cancelled', 'canceled'].includes(status)) {
      throw new BadRequestException('Estado no válido para la prueba.');
    }
    return this.run(async () => {
      await this.getTestPreapproval(preapprovalId);
      return this.fetchToMp.updatePreapproval(preapprovalId, { status });
    });
  }

  async createPayment(command: MpTestPaymentCommand): Promise<string> {
    this.assertAmount(command.amount);
    const externalReference = `${EXTERNAL_REFERENCE_PREFIX.TEST}${randomUUID()}`;
    const identification =
      command.identificationType && command.identificationNumber
        ? { type: command.identificationType, number: command.identificationNumber }
        : undefined;
    return this.run(() =>
      this.fetchToMp.createPayment(
        {
          transaction_amount: command.amount,
          token: command.cardTokenId,
          description: 'Prueba de pago único de Soon Publicité (admin)',
          installments: 1,
          payment_method_id: command.paymentMethodId,
          ...(command.issuerId ? { issuer_id: command.issuerId } : {}),
          payer: {
            email: command.payerEmail,
            ...(identification ? { identification } : {}),
          },
          external_reference: externalReference,
        },
        externalReference,
      ),
    );
  }

  async listEvents(limit: number) {
    return this.events.list(limit);
  }

  /* ------------------------------------------------------------------ */

  /** Sólo se operan preapprovals de prueba: nunca una suscripción real desde esta página. */
  private async getTestPreapproval(preapprovalId: string): Promise<any> {
    const preapproval = await this.fetchToMp.getDataFromMp_fetch(PREAPPROVAL_URL + preapprovalId);
    const reference: string = preapproval?.external_reference ?? '';
    if (!reference.startsWith(EXTERNAL_REFERENCE_PREFIX.TEST)) {
      throw new BadRequestException(
        'Esta página sólo opera suscripciones de prueba (external_reference mptest:).',
      );
    }
    return preapproval;
  }

  private assertAmount(amount: number) {
    if (!Number.isFinite(amount) || amount <= 0 || amount > MAX_TEST_AMOUNT) {
      throw new BadRequestException(`El monto de prueba tiene que estar entre $1 y $${MAX_TEST_AMOUNT}.`);
    }
  }

  private async run(call: () => Promise<any>): Promise<string> {
    try {
      return JSON.stringify(await call(), null, 2);
    } catch (error: any) {
      if (error instanceof BadRequestException) throw error;
      this.logger.error('Prueba de MP con error: ' + (error?.message ?? error));
      const body =
        error instanceof MercadoPagoApiError
          ? { error: true, status: error.status, body: error.body }
          : { error: true, message: error?.message ?? String(error) };
      return JSON.stringify(body, null, 2);
    }
  }

  private clientUrl(): string {
    const url =
      this.configService.get<string>('CLIENT_URL') ||
      this.configService.get<string>('PUBLICITE_CORS_VERCEL_URI') ||
      'https://soonpublicite.com';
    return url.replace(/\/+$/, '');
  }
}
