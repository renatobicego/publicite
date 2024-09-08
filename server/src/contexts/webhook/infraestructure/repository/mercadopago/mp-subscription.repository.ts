import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BadRequestException } from '@nestjs/common';
import { getLocalTimeZone, today } from '@internationalized/date';

import { SubscriptionResponse } from '../../controllers/response/subscription.response';
import { SubscriptionDocument } from '../../schemas/mercadopago/subscription.schema';
import { MyLoggerService } from 'src/contexts/shared/logger/logger.service';
import { SubscriptionRepositoryInterface } from 'src/contexts/webhook/domain/mercadopago/repository/mp-subscription.respository.interface';

export class SubscriptionRepository implements SubscriptionRepositoryInterface {
  constructor(
    private readonly logger: MyLoggerService,
    @InjectModel('Subscription')
    private readonly subscriptionModel: Model<SubscriptionDocument>,
  ) {}
  async getActiveSubscriptionByEmail(
    email: string,
  ): Promise<SubscriptionResponse | null> {
    // PENDIENTE: TENEMOS QUE VER QUE DIA ES HOY Y CONSULTAR PARA TRAER LAS SUS QUE TENGAN UN END DATE( DEBERIA SER 1 SOLA) MAYOR QUE HOY
    const todayDate = today(getLocalTimeZone()).toString();
    try {
      const subscription = await this.subscriptionModel.findOne({
        external_reference: email,
        endDate: { $gte: todayDate },
      });

      if (!subscription) return null;

      const subs: SubscriptionResponse = {
        mpPreapprovalId: subscription.mpPreapprovalId,
        payerId: subscription.payerId,
        status: subscription.status,
        subscriptionPlan: subscription.subscriptionPlan,
        startDate: subscription.startDate,
        endDate: subscription.endDate,
        external_reference: subscription.external_reference,
      };

      return subs;
    } catch (error: any) {
      throw new BadRequestException('Error retrieving active subscription');
    }
  }

  async getSubscriptionByEmail(
    subID: string,
    email: string,
  ): Promise<SubscriptionResponse[]> {
    this.logger.log('Searching all subscriptions by email: ' + email);
    try {
      const subscriptions = await this.subscriptionModel.find({
        subscriptionPlan: subID,
        external_reference: email,
      });
      if (!subscriptions) return [];
      const subs: SubscriptionResponse[] = subscriptions.map(
        (sub: SubscriptionDocument) => {
          return new SubscriptionResponse(
            sub.mpPreapprovalId,
            sub.payerId,
            sub.status,
            sub.subscriptionPlan,
            sub.startDate,
            sub.endDate,
            sub.external_reference,
          );
        },
      );

      return subs;
    } catch (error: any) {
      throw error;
    }
  }
}
