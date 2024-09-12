import { BadRequestException, Inject } from '@nestjs/common';

import { SubscriptionRepositoryInterface } from 'src/contexts/webhook/domain/mercadopago/repository/mp-subscription.respository.interface';
import { SubscriptionServiceInterface } from 'src/contexts/webhook/domain/mercadopago/service/mp-subscription.service.interface';
import Subscription from 'src/contexts/webhook/domain/mercadopago/entity/subcription.entity';
import { MyLoggerService } from 'src/contexts/shared/logger/logger.service';
import { MercadoPagoSubscriptionPlanServiceInterface } from 'src/contexts/webhook/domain/mercadopago/service/mp-subscriptionPlan.service.interface';

export class MpSubscriptionService implements SubscriptionServiceInterface {
  constructor(
    @Inject('SubscriptionRepositoryInterface')
    private readonly subscriptionRepository: SubscriptionRepositoryInterface,
    private readonly logger: MyLoggerService,
    @Inject('MercadoPagoSubscriptionPlanServiceInterface')
    private readonly mpSubscriptionPlanService: MercadoPagoSubscriptionPlanServiceInterface,
  ) {}

  async cancelSubscription_preapproval(id: string): Promise<void> {
    try {
      this.logger.log(
        'Subscription cancelled: The subscription ID:' +
          id +
          'will be cancelled - Class: mpWebhookService',
      );

      await this.subscriptionRepository.cancelSubscription(id);
      return Promise.resolve();
    } catch (error: any) {
      throw error;
    }
  }
  async createSubscription_preapproval(
    subscription_preapproval: any,
  ): Promise<void> {
    this.logger.log('---SUBSCRIPTION SERVICE---');
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
      const newUserSuscription = new Subscription(
        id, // ID de la suscripción
        payer_id, // id del payer
        status, // estado de la suscripción
        planID, // id del plan en nuestro sistema
        start_date, // fecha de inicio
        end_date, // fecha de fin
        external_reference, // identificador de usuario (Es el ID de clerk)
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
    const {
      id,
      // payer_id,
      status,
      // preapproval_plan_id,
      // auto_recurring,
      external_reference,
    } = subscription_preapproval_update;

    if (status === 'cancelled') {
      await this.cancelSubscription_preapproval(id);
      return Promise.resolve();
    }

    const updateObject = {
      status: status,
      external_reference: external_reference,
    };

    await this.subscriptionRepository.updateSubscription(id, updateObject);

    return Promise.resolve();
  }

  parseTimeX(date: string): string {
    return date.split('T')[0];
  }
}
