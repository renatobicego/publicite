import {
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { MyLoggerService } from 'src/contexts/module_shared/logger/logger.service';
import { isPaidPlanSubscription } from 'src/contexts/module_shared/subscriptions/active-subscription.match';
import { payerOfSubscription } from 'src/contexts/module_shared/subscriptions/external-reference';
import {
  isMpBackedSubscription,
  SubscriptionKind,
  subscriptionKindOf,
} from 'src/contexts/module_shared/subscriptions/subscription.kind';
import { FetchToMpInterface } from '../adapter/out/fech.to.mp.interface';
import { MercadoPagoApiError } from '../adapter/out/mercadopago.api.error';
import {
  MpCheckoutServiceInterface,
  StartSubscriptionCheckoutCommand,
  SubscriptionCheckoutResult,
} from '../../domain/service/mp-checkout.service.interface';
import { SubscriptionServiceInterface } from '../../domain/service/mp-subscription.service.interface';
import { MercadoPagoSubscriptionPlanServiceInterface } from '../../domain/service/mp-subscriptionPlan.service.interface';
import { ErrorServiceInterface } from '../../domain/service/error/error.service.interface';
import { PaymentNotificationService } from '../../infastructure/adapters/handler/PaymentNotificationService';

const PREAPPROVAL_URL = 'https://api.mercadopago.com/preapproval/';
const PREAPPROVAL_PLAN_URL = 'https://api.mercadopago.com/preapproval_plan/';

const PLAN_UNAVAILABLE = 'Este plan no está disponible en este momento.';
const PREVIOUS_NOT_CANCELLED =
  'Tu plan nuevo quedó activo, pero no pudimos dar de baja el anterior. Escribinos a soporte para que lo cancelemos y no se te cobre.';

/*
Altas, bajas y cambio de tarjeta de las suscripciones, hechas por el server.

Antes las hacía el cliente contra MercadoPago desde una ruta pública de Next: el
navegador decidía el usuario (`external_reference`) y el monto, cualquiera podía
cancelar o cambiarle la tarjeta a una suscripción ajena, y el id del preapproval
se descartaba. Acá el usuario sale del token, el plan y el monto salen de la base
y de MP, y la suscripción se registra apenas MP la acepta (MP no manda el webhook
"created"; el webhook queda como respaldo).
*/
@Injectable()
export class MpCheckoutService implements MpCheckoutServiceInterface {
  constructor(
    @Inject('SubscriptionServiceInterface')
    private readonly subscriptionService: SubscriptionServiceInterface,
    @Inject('MercadoPagoSubscriptionPlanServiceInterface')
    private readonly planService: MercadoPagoSubscriptionPlanServiceInterface,
    @Inject('FetchToMpInterface')
    private readonly fetchToMp: FetchToMpInterface,
    @Inject('ErrorServiceInterface')
    private readonly errorService: ErrorServiceInterface,
    private readonly paymentNotificationService: PaymentNotificationService,
    private readonly configService: ConfigService,
    private readonly logger: MyLoggerService,
  ) {}

  async startSubscriptionCheckout(
    userId: string,
    command: StartSubscriptionCheckoutCommand,
  ): Promise<SubscriptionCheckoutResult> {
    const plan = await this.planService.findSubscriptionPlanByMeliID(
      command.mpPreapprovalPlanId,
    );
    if (!plan || !plan.getIsActive() || plan.getIsFree()) {
      throw new BadRequestException(PLAN_UNAVAILABLE);
    }
    const mpPlan = await this.getActiveMpPlan(command.mpPreapprovalPlanId);

    const planId = String(plan.getId());
    const active = await this.subscriptionService.getActiveSubscriptions(userId);
    let previous: any = null;

    if (plan.getIsPack()) {
      if (command.replacesSubscriptionId) {
        throw new BadRequestException('Un pack se suma a tu plan: no lo reemplaza.');
      }
      // Uno de cada uno: hoy lo bloqueaba la página del checkout; ahora lo valida el server.
      const alreadyHasPack = active.some(
        (subscription: any) => planIdOf(subscription) === planId,
      );
      if (alreadyHasPack) {
        throw new BadRequestException('Ya tenés este pack activo.');
      }
    } else {
      const paidPlans = active.filter(isPaidPlanSubscription);
      if (command.replacesSubscriptionId) {
        previous =
          paidPlans.find(
            (subscription: any) =>
              subscription.mpPreapprovalId === command.replacesSubscriptionId,
          ) ?? null;
        const isOwnMpPlan =
          previous &&
          subscriptionKindOf(previous) === SubscriptionKind.MP &&
          payerOfSubscription(previous) === userId;
        if (!isOwnMpPlan) {
          throw new BadRequestException('No encontramos el plan que querés cambiar.');
        }
        if (planIdOf(previous) === planId) {
          throw new BadRequestException('Ya tenés este plan.');
        }
      } else if (paidPlans.length > 0) {
        throw new BadRequestException(
          'Ya tenés un plan pago. Para pasarte a otro, usá "Cambiar plan" en la configuración de tu cuenta.',
        );
      }
    }

    let created: any;
    try {
      created = await this.fetchToMp.createPreapproval({
        preapproval_plan_id: command.mpPreapprovalPlanId,
        reason: mpPlan.reason,
        external_reference: userId,
        payer_email: command.payerEmail,
        card_token_id: command.cardTokenId,
        auto_recurring: mpPlan.auto_recurring,
        back_url: `${this.clientUrl()}/suscribirse/suscripcion-exitosa`,
      });
    } catch (error: any) {
      throw this.toUserError(error);
    }

    const mpPreapprovalId: string | undefined = created?.id;
    if (!mpPreapprovalId) {
      this.logger.error(
        `MercadoPago aceptó el alta del usuario ${userId} pero no devolvió el id del preapproval: ${JSON.stringify(created)}`,
      );
      throw new InternalServerErrorException(
        'MercadoPago no confirmó la suscripción. Antes de intentar de nuevo, escribinos a soporte para revisar si se hizo el cobro.',
      );
    }

    const { registered, status } = await this.registerNow(
      mpPreapprovalId,
      created,
      userId,
      command.mpPreapprovalPlanId,
    );

    let previousSubscriptionCancelled: boolean | null = null;
    let warning: string | null = null;
    if (previous) {
      previousSubscriptionCancelled = await this.cancelPrevious(
        previous.mpPreapprovalId,
        userId,
      );
      if (!previousSubscriptionCancelled) warning = PREVIOUS_NOT_CANCELLED;
    }

    return {
      mpPreapprovalId,
      status,
      registered,
      previousSubscriptionCancelled,
      warning,
    };
  }

  async cancelMySubscription(userId: string, mpPreapprovalId: string): Promise<boolean> {
    const subscription = await this.findOwnSubscription(userId, mpPreapprovalId);
    if (subscriptionKindOf(subscription) !== SubscriptionKind.MP) {
      throw new BadRequestException('Esta suscripción no se cancela desde acá.');
    }
    if (subscription.status === 'cancelled') return true;

    try {
      await this.fetchToMp.changeSubscriptionStatusInMercadopago_fetch(
        PREAPPROVAL_URL,
        mpPreapprovalId,
        'cancelled',
      );
    } catch (error: any) {
      this.logger.error(
        `No se pudo cancelar en MP la suscripción ${mpPreapprovalId} del usuario ${userId}: ` +
          (error?.message ?? error),
      );
      throw new ServiceUnavailableException(
        'No pudimos cancelar la suscripción en MercadoPago. Probá de nuevo en unos minutos.',
      );
    }
    await this.subscriptionService.cancelSubscriptionInDb(mpPreapprovalId);
    return true;
  }

  async updateMySubscriptionCard(
    userId: string,
    mpPreapprovalId: string,
    cardTokenId: string,
  ): Promise<boolean> {
    const subscription = await this.findOwnSubscription(userId, mpPreapprovalId);
    if (!isMpBackedSubscription(subscription) || subscription.status === 'cancelled') {
      throw new BadRequestException('Esta suscripción no tiene una tarjeta para cambiar.');
    }
    try {
      await this.fetchToMp.updatePreapproval(mpPreapprovalId, {
        card_token_id: cardTokenId,
      });
    } catch (error: any) {
      throw this.toUserError(error);
    }
    return true;
  }

  /* ------------------------------------------------------------------ */

  private async findOwnSubscription(userId: string, mpPreapprovalId: string): Promise<any> {
    const subscription =
      await this.subscriptionService.findSubscriptionByPreapprovalId(mpPreapprovalId);
    if (!subscription || payerOfSubscription(subscription) !== userId) {
      // Igual que si no existiera: no se confirma que la suscripción es de otro.
      throw new NotFoundException('No encontramos esa suscripción.');
    }
    return subscription;
  }

  private async getActiveMpPlan(mpPreapprovalPlanId: string): Promise<any> {
    let mpPlan: any;
    try {
      mpPlan = await this.fetchToMp.getDataFromMp_fetch(
        PREAPPROVAL_PLAN_URL + mpPreapprovalPlanId,
      );
    } catch (error: any) {
      this.logger.error(
        `No se pudo leer el plan ${mpPreapprovalPlanId} en MP: ` + (error?.message ?? error),
      );
      throw new BadRequestException(PLAN_UNAVAILABLE);
    }
    if (mpPlan?.status !== 'active' || !mpPlan?.auto_recurring?.transaction_amount) {
      this.logger.error(
        `El plan ${mpPreapprovalPlanId} no está activo en MP (status: ${mpPlan?.status}).`,
      );
      throw new BadRequestException(PLAN_UNAVAILABLE);
    }
    return mpPlan;
  }

  /*
  Registra la suscripción apenas MP la acepta. Si algo falla al guardar, el cobro
  ya está hecho: no se le devuelve error al usuario (reintentaría y pagaría dos
  veces); queda en el log y la registra el webhook.
  */
  private async registerNow(
    mpPreapprovalId: string,
    created: any,
    userId: string,
    mpPreapprovalPlanId: string,
  ): Promise<{ registered: boolean; status: string }> {
    let preapproval: any = created;
    try {
      preapproval = await this.fetchToMp.getDataFromMp_fetch(PREAPPROVAL_URL + mpPreapprovalId);
    } catch (error: any) {
      this.logger.warn(
        `No se pudo releer el preapproval ${mpPreapprovalId}; se registra con la respuesta del alta.`,
      );
    }
    // MP no siempre devuelve el external_reference: el dueño es el del token.
    preapproval = {
      ...preapproval,
      external_reference: preapproval?.external_reference || userId,
      preapproval_plan_id: preapproval?.preapproval_plan_id || mpPreapprovalPlanId,
    };
    const status: string = preapproval?.status ?? created?.status ?? 'pending';

    try {
      const existed =
        await this.subscriptionService.findSubscriptionByPreapprovalId(mpPreapprovalId);
      await this.subscriptionService.createSubscription_preapproval(preapproval);
      if (!existed && preapproval?.auto_recurring?.free_trial) {
        await this.notifyFreeTrial(preapproval, userId);
      }
      return { registered: true, status };
    } catch (error: any) {
      this.logger.error(
        `MP aceptó la suscripción ${mpPreapprovalId} del usuario ${userId} pero no se pudo registrar; la va a registrar el webhook: ` +
          (error?.message ?? error),
      );
      return { registered: false, status };
    }
  }

  private async notifyFreeTrial(preapproval: any, userId: string): Promise<void> {
    try {
      await this.paymentNotificationService.sendPaymentNotification({
        subscriptionPlanId: preapproval.preapproval_plan_id,
        reason: preapproval.reason,
        status: 'free_trial',
        retryAttemp: 1,
        userId,
      });
    } catch (error: any) {
      this.logger.error('No se pudo avisar la prueba gratis: ' + (error?.message ?? error));
    }
  }

  /*
  Cambio de plan: el nuevo ya está cobrado, así que el viejo se tiene que dar de
  baja. Se intenta dos veces; si MP no responde se deja un error para el admin y
  el usuario recibe el aviso (nunca se muestra "listo" con dos planes cobrándose).
  */
  private async cancelPrevious(mpPreapprovalId: string, userId: string): Promise<boolean> {
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        await this.fetchToMp.changeSubscriptionStatusInMercadopago_fetch(
          PREAPPROVAL_URL,
          mpPreapprovalId,
          'cancelled',
        );
        try {
          await this.subscriptionService.cancelSubscriptionInDb(mpPreapprovalId);
        } catch (error: any) {
          // En MP ya está cancelada: el webhook "cancelled" la va a marcar igual.
          this.logger.error(
            `La suscripción ${mpPreapprovalId} se canceló en MP pero no en la base: ` +
              (error?.message ?? error),
          );
        }
        return true;
      } catch (error: any) {
        this.logger.error(
          `Intento ${attempt} de cancelar el plan anterior ${mpPreapprovalId} del usuario ${userId}: ` +
            (error?.message ?? error),
        );
      }
    }
    try {
      await this.errorService.createNewError(userId, {
        code: 'CHANGE_PLAN_CANCEL_FAILED',
        message:
          'El usuario cambió de plan y no se pudo cancelar el anterior en MercadoPago. Hay que cancelarlo a mano.',
        result: { preapprovalId: mpPreapprovalId },
        event: 'change_plan',
      });
    } catch (error: any) {
      this.logger.error('No se pudo registrar el error del cambio de plan: ' + (error?.message ?? error));
    }
    return false;
  }

  private clientUrl(): string {
    const url =
      this.configService.get<string>('CLIENT_URL') ||
      this.configService.get<string>('PUBLICITE_CORS_VERCEL_URI') ||
      'https://soonpublicite.com';
    return url.replace(/\/+$/, '');
  }

  /* Traduce un rechazo de MP a un mensaje que el usuario entienda. */
  private toUserError(error: any): Error {
    if (!(error instanceof MercadoPagoApiError)) return error;
    const detail = error.detail;
    if (error.status >= 500) {
      return new ServiceUnavailableException(
        'MercadoPago no está respondiendo. Probá de nuevo en unos minutos.',
      );
    }
    if (/reject|rechaz|insufficient|high_risk|blacklist|cc_/.test(detail)) {
      return new BadRequestException(
        'La tarjeta fue rechazada. Probá con otra tarjeta o consultá con tu banco.',
      );
    }
    if (/token/.test(detail)) {
      return new BadRequestException(
        'No pudimos validar la tarjeta. Volvé a cargar los datos e intentá de nuevo.',
      );
    }
    if (/payer|email/.test(detail)) {
      return new BadRequestException('Revisá el email del pagador e intentá de nuevo.');
    }
    return new BadRequestException(
      'No pudimos procesar el pago. Revisá los datos de la tarjeta e intentá de nuevo.',
    );
  }
}

function planIdOf(subscription: any): string {
  const plan = subscription?.subscriptionPlan;
  return String(plan?._id ?? plan ?? '');
}
