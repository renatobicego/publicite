import { Inject } from '@nestjs/common';

import { SubscriptionAdapterInterface } from 'src/contexts/module_webhook/mercadopago/application/adapter/in/mp-subscription.adapter.interface';
import { SubscriptionServiceInterface } from 'src/contexts/module_webhook/mercadopago/domain/service/mp-subscription.service.interface';
import { FetchToMpInterface } from '../../../application/adapter/out/fech.to.mp.interface';
import { MyLoggerService } from 'src/contexts/module_shared/logger/logger.service';

export class SubscriptionAdapter implements SubscriptionAdapterInterface {
  constructor(
    @Inject('SubscriptionServiceInterface')
    private readonly subscriptionService: SubscriptionServiceInterface,
    @Inject('FetchToMpInterface')
    private readonly fetchToMpAdapter: FetchToMpInterface,
    private readonly logger: MyLoggerService,
  ) {}
  /*
  Borrado de cuenta: cancela en MP las suscripciones activas que paga el usuario.
  Sólo las que tienen preapproval (las temporales de cambio de plan y los regalos
  no). Se esperan una por una: antes era un forEach(async) que respondía antes de
  cancelar y perdía los errores. Un fallo no corta las demás; se deja en el log.
  */
  async deleteSubscription(id: string): Promise<void> {
    const subscriptions =
      await this.subscriptionService.getActiveMpSubscriptionsPaidBy(id);
    if (!subscriptions || subscriptions.length === 0) {
      return;
    }
    for (const subscription of subscriptions) {
      try {
        await this.fetchToMpAdapter.changeSubscriptionStatusInMercadopago_fetch(
          'https://api.mercadopago.com/preapproval/',
          subscription.mpPreapprovalId,
          'cancelled',
        );
        await this.subscriptionService.cancelSubscriptionInDb(
          subscription.mpPreapprovalId,
        );
      } catch (error: any) {
        this.logger.error(
          `No se pudo cancelar la suscripción ${subscription.mpPreapprovalId} al borrar la cuenta ${id}: ` +
            (error?.message ?? error),
        );
      }
    }
  }
  async getSubscriptionHistory(external_reference: string): Promise<any[]> {
    try {
      const subscriptions =
        await this.subscriptionService.getSubscriptionHistory(
          external_reference,
        );
      return subscriptions;
    } catch (error: any) {
      throw error;
    }
  }
}
