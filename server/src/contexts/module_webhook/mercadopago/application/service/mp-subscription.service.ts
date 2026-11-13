import { BadRequestException, Inject } from '@nestjs/common';

import {
  statusOfSubscription,
  SubscriptionServiceInterface,
} from 'src/contexts/module_webhook/mercadopago/domain/service/mp-subscription.service.interface';
import Subscription from 'src/contexts/module_webhook/mercadopago/domain/entity/subcription.entity';
import { MyLoggerService } from 'src/contexts/module_shared/logger/logger.service';
import { MercadoPagoSubscriptionPlanServiceInterface } from 'src/contexts/module_webhook/mercadopago/domain/service/mp-subscriptionPlan.service.interface';
import { SubscriptionRepositoryInterface } from '../../domain/repository/mp-subscription.respository.interface';
import { getTodayDateTime } from 'src/contexts/module_shared/utils/functions/getTodayDateTime';
import { UserServiceInterface } from 'src/contexts/module_user/user/domain/service/user.service.interface';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import makeReponsePlanFunction from './function/makeResponsePlan';
import parseTimeX from './function/parse_time';
import { resolveExternalReference } from 'src/contexts/module_shared/subscriptions/external-reference';
import { isPaidPlanSubscription } from 'src/contexts/module_shared/subscriptions/active-subscription.match';
import { SubscriptionKind } from 'src/contexts/module_shared/subscriptions/subscription.kind';

export class MpSubscriptionService implements SubscriptionServiceInterface {
  constructor(
    @Inject('SubscriptionRepositoryInterface')
    private readonly subscriptionRepository: SubscriptionRepositoryInterface,
    private readonly logger: MyLoggerService,
    @Inject('MercadoPagoSubscriptionPlanServiceInterface')
    private readonly mpSubscriptionPlanService: MercadoPagoSubscriptionPlanServiceInterface,
    @Inject('UserServiceInterface')
    private readonly userService: UserServiceInterface,
    @InjectConnection() private readonly connection: Connection,
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
      next_payment_date,
      payment_method_id,
      card_id,
    } = subscription_preapproval ?? {};

    if (!auto_recurring || !auto_recurring.start_date || !external_reference) {
      this.logger.error('Invalid subscription data - missing dates');
      throw new BadRequestException('Invalid subscription data');
    }

    const reference = resolveExternalReference(external_reference);
    if (reference.type !== 'user') {
      // Regalos y Hacete Amigo tienen su propio alta; acá sólo entran las de un usuario.
      this.logger.error(
        `El preapproval ${id} no es de un usuario (external_reference: ${external_reference})`,
      );
      throw new BadRequestException('Invalid subscription data');
    }
    const userId = reference.userId;

    /*
    Alta idempotente: el checkout la registra apenas MP acepta el pago y después
    llegan los webhooks; y MP reintenta los eventos. Si ya existe, sólo se
    actualiza y se asegura que el usuario la tenga.
    */
    const existing = await this.subscriptionRepository.findSubscriptionByPreapprovalId(id);
    if (existing) {
      this.logger.warn(`La suscripción ${id} ya estaba registrada: se actualiza.`);
      await this.updateSubscription_preapproval(subscription_preapproval);
      await this.userService.setSubscriptionToUser(userId, existing._id, null);
      return;
    }

    const session = await this.connection.startSession();
    this.logger.log('Data of suscription is valid... Continue to create it');
    let { start_date, frequency } = auto_recurring;
    const { start_date_parsed, end_date_parsed } = parseTimeX(
      start_date,
      frequency,
    );

    start_date = start_date_parsed;
    let end_date = end_date_parsed;

    //Buscamos el plan al que pertenece la suscripción
    this.logger.log('Searching plan for this suscription');
    const plan =
      await this.mpSubscriptionPlanService.findSubscriptionPlanByMeliID(
        preapproval_plan_id,
      );

    if (!plan) {
      await session.endSession();
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
      const timeOfUpdate = getTodayDateTime();
      const newUserSuscription = new Subscription(
        id, // ID de la suscripción
        payer_id, // id del payer
        status, // estado de la suscripción
        planID, // id del plan en nuestro sistema
        start_date, // fecha de inicio
        end_date, // fecha de fin
        external_reference, // identificador de usuario (Es el ID de mongo db)
        timeOfUpdate, // dia de actualización
        next_payment_date, // fecha de siguiente pago
        payment_method_id, // metodo de pago
        card_id, // id de la tarjeta
        undefined,
        { kind: SubscriptionKind.MP, payerUser: userId },
      );
      await session.withTransaction(async () => {
        const subscriptionId =
          await this.subscriptionRepository.saveSubPreapproval(
            newUserSuscription,
            session,
          );
        await this.userService.setSubscriptionToUser(
          userId,
          subscriptionId,
          session,
        );
      });
    } catch (error: any) {
      throw error;
    } finally {
      await session.endSession();
    }
  }

  async changeStatusOfSubscription(
    preapproval_id: string,
    status: statusOfSubscription,
  ): Promise<void> {
    try {
      this.logger.log('Changin status of subscription NEW STATUS: ' + status);
      const statusObj = {
        status: status,
        timeOfUpdate: getTodayDateTime(),
      };
      await this.subscriptionRepository.updateSubscriptionStatus(
        preapproval_id,
        statusObj,
      );
    } catch (error: any) {
      throw error;
    }
  }

  async findSubscriptionByPreapprovalId(id: string): Promise<any> {
    const subscription =
      await this.subscriptionRepository.findSubscriptionByPreapprovalId(id);

    return subscription;
  }

  async getSubscriptionHistory(userId: string): Promise<Subscription[]> {
    try {
      const subscriptions =
        await this.subscriptionRepository.getSubscriptionHistory(userId);
      return makeReponsePlanFunction(subscriptions);
    } catch (error: any) {
      throw error;
    }
  }

  async getActiveSubscriptions(userId: string): Promise<any[]> {
    try {
      return await this.subscriptionRepository.getActiveSubscriptions(userId);
    } catch (error: any) {
      throw error;
    }
  }

  /*
  Activas que no son el plan gratuito: planes, packs, el extra temporal, los
  compartidos y los regalados. Decide si un pago rechazado le baja el plan al
  usuario (si le queda alguna, sus límites no quedaron en el gratuito).
  */
  async getActivePaidSubscriptions(userId: string): Promise<any[]> {
    const active = await this.getActiveSubscriptions(userId);
    return active.filter((subscription: any) => {
      const plan = subscription?.subscriptionPlan;
      return plan && typeof plan === 'object' && !plan.isFree;
    });
  }

  async hasPaidPlan(userId: string): Promise<boolean> {
    const active = await this.getActiveSubscriptions(userId);
    return active.some(isPaidPlanSubscription);
  }

  async getActiveMpSubscriptionsPaidBy(userId: string): Promise<any[]> {
    return this.subscriptionRepository.getActiveMpSubscriptionsPaidBy(userId);
  }

  async cancelSubscriptionInDb(mpPreapprovalId: string): Promise<void> {
    await this.subscriptionRepository.cancelSubscription(mpPreapprovalId);
  }

  async updateSubscription_preapproval(
    subscription_preapproval_update: any,
  ): Promise<void> {
    try {
      const {
        id,
        payer_id,
        status,
        auto_recurring,
        external_reference,
        next_payment_date,
        payment_method_id,
        card_id,
      } = subscription_preapproval_update;
      let { start_date, frequency } = auto_recurring;
      const { start_date_parsed, end_date_parsed } = parseTimeX(
        start_date,
        frequency,
      );

      start_date = start_date_parsed;
      let end_date = end_date_parsed;
      const timeOfUpdate = getTodayDateTime();

      const updateObject = {
        mpPreapprovalId: id,
        payerId: payer_id ?? '',
        status: status,
        external_reference: external_reference,
        startDate: start_date,
        endDate: end_date,
        timeOfUpdate: timeOfUpdate,
        nextPaymentDate: next_payment_date,
        paymentMethodId: payment_method_id,
        cardId: card_id,
      };

      const statusSubscriptionMap = new Map<
        string,
        (id: string, updateObj?: any) => Promise<void>
      >([
        [
          'cancelled',
          (id) => this.subscriptionRepository.cancelSubscription(id),
        ],
        [
          'paused',
          (id, updateObj) =>
            this.subscriptionRepository.pauseSubscription(id, updateObj),
        ],
        [
          'pending',
          (id, updateObj) =>
            this.subscriptionRepository.pendingSubscription(id, updateObj),
        ],
        [
          'authorized',
          (id, updateObj) =>
            this.subscriptionRepository.updateSubscription(id, updateObj),
        ],
      ]);

      const action = statusSubscriptionMap.get(status);

      if (action) {
        await action(id, updateObject);
        return Promise.resolve();
      }
    } catch (error: any) {
      throw error;
    }
  }

  async verifyIfSubscriptionWasPused(preapproval_id: string): Promise<boolean> {
    try {
      this.logger.log(
        'Verifing if subscription was pused ID:' + preapproval_id,
      );
      return await this.subscriptionRepository.verifyIfSubscriptionWasPused(
        preapproval_id,
      );
    } catch (error: any) {
      this.logger.error(
        'Error verifying if subscription was pused ID:' + preapproval_id,
      );
      throw error;
    }
  }
}
