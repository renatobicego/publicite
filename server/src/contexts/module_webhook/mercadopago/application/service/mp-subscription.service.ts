import { BadRequestException, Inject } from '@nestjs/common';
import { getLocalTimeZone, now } from '@internationalized/date';

import { SubscriptionServiceInterface } from 'src/contexts/module_webhook/mercadopago/domain/service/mp-subscription.service.interface';
import Subscription from 'src/contexts/module_webhook/mercadopago/domain/entity/subcription.entity';
import { MyLoggerService } from 'src/contexts/module_shared/logger/logger.service';
import { MercadoPagoSubscriptionPlanServiceInterface } from 'src/contexts/module_webhook/mercadopago/domain/service/mp-subscriptionPlan.service.interface';
import { SubscriptionRepositoryInterface } from '../../domain/repository/mp-subscription.respository.interface';

export class MpSubscriptionService implements SubscriptionServiceInterface {
  constructor(
    @Inject('SubscriptionRepositoryInterface')
    private readonly subscriptionRepository: SubscriptionRepositoryInterface,
    private readonly logger: MyLoggerService,
    @Inject('MercadoPagoSubscriptionPlanServiceInterface')
    private readonly mpSubscriptionPlanService: MercadoPagoSubscriptionPlanServiceInterface,
  ) {}

  async createSubscription_preapproval(
    subscription_preapproval: any,
  ): Promise<void> {
    this.logger.log('---------------SUBSCRIPTION SERVICE------------------');
    // Crear el nuevo objeto de suscripción
    const {
      id,
      payer_id,
      status,
      preapproval_plan_id,
      auto_recurring,
      external_reference,
    } = subscription_preapproval;

    if (
      !auto_recurring ||
      !auto_recurring.start_date ||
      !auto_recurring.end_date ||
      !external_reference
    ) {
      this.logger.error('Invalid subscription data - missing dates');
      throw new BadRequestException('Invalid subscription data');
    }
    let { start_date, end_date } = auto_recurring;
    start_date = this.parseTimeX(start_date);
    end_date = this.parseTimeX(end_date);

    //Buscamos el plan al que pertenece la suscripción
    const plan =
      await this.mpSubscriptionPlanService.findSubscriptionPlanByMeliID(
        preapproval_plan_id,
      );

    if (!plan) {
      this.logger.error('Plan not found - Class: mpWebhookService');
      throw new BadRequestException(
        "Plan not found, we can't create the subscription",
      );
    }
    const planID = plan.getId();
    try {
      this.logger.log(
        'Creating a new subscription with ID: ' +
          id +
          'external reference: ' +
          external_reference +
          'for plan ' +
          plan.getDescription() +
          ' - Class: mpWebhookService',
      );
      const timeOfUpdate = now(getLocalTimeZone()).toString();
      const newUserSuscription = new Subscription(
        id, // ID de la suscripción
        payer_id, // id del payer
        status, // estado de la suscripción
        planID, // id del plan en nuestro sistema
        start_date, // fecha de inicio
        end_date, // fecha de fin
        external_reference, // identificador de usuario (Es el ID de clerk)
        timeOfUpdate, // dia de actualización
      );
      await this.subscriptionRepository.saveSubPreapproval(newUserSuscription);
    } catch (error: any) {
      throw error;
    }
  }
  async findSubscriptionByPreapprovalId(
    id: string,
  ): Promise<Subscription | null> {
    const subscription =
      await this.subscriptionRepository.findSubscriptionByPreapprovalId(id);

    return subscription;
  }

  async getSubscriptionHistory(
    external_reference: string,
  ): Promise<Subscription[]> {
    try {
      const subscriptions =
        this.subscriptionRepository.getSubscriptionHistory(external_reference);
      return subscriptions;
    } catch (error: any) {
      throw error;
    }
  }

  async updateSubscription_preapproval(
    subscription_preapproval_update: any,
  ): Promise<void> {
    const { id, payer_id, status, auto_recurring, external_reference } =
      subscription_preapproval_update;
    let { start_date, end_date } = auto_recurring;
    start_date = this.parseTimeX(start_date);
    end_date = this.parseTimeX(end_date);
    const timeOfUpdate = now(getLocalTimeZone()).toString();
    const updateObject = {
      mpPreapprovalId: id,
      payerId: payer_id ?? '',
      status: status,
      external_reference: external_reference,
      startDate: start_date,
      endDate: end_date,
      timeOfUpdate: timeOfUpdate,
    };

    switch (status) {
      case 'cancelled':
        await this.subscriptionRepository.cancelSubscription(id);
        return Promise.resolve();
      case 'paused':
        await this.subscriptionRepository.pauseSubscription(id, updateObject);
        return Promise.resolve();
      case 'authorized':
        await this.subscriptionRepository.updateSubscription(id, updateObject);
        return Promise.resolve();
      default:
        break;
    }
  }

  parseTimeX(date: string): string {
    return date.split('T')[0];
  }
}
