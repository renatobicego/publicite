import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId } from 'mongoose';

import { MyLoggerService } from 'src/contexts/module_shared/logger/logger.service';
import { SubscriptionDocument } from '../schemas/subscription.schema';
import Subscription from 'src/contexts/module_webhook/mercadopago/domain/entity/subcription.entity';
import MercadoPagoEventsRepositoryInterface from '../../domain/repository/mp-events.repository.interface';



export default class MercadoPagoEventsRepository
  implements MercadoPagoEventsRepositoryInterface {
  constructor(
    private readonly logger: MyLoggerService,
    @InjectModel('Subscription')
    private readonly subscriptionModel: Model<SubscriptionDocument>,
  ) { }

  async findAllSubscriptions(): Promise<any[]> {
    this.logger.log('Find all subscriptions');
    return await this.subscriptionModel.find().lean()

  }

  async findStatusOfUserSubscription(
    payerId: string,
    subscriptionPlan: ObjectId,
    external_reference: string,
  ): Promise<any | null> {
    this.logger.log(
      `Finding subscription status of  payerId: ${payerId} and subscriptionPlanid: ${subscriptionPlan} and external_reference: ${external_reference}`,
    );
    return await this.subscriptionModel.findOne({
      payerId,
      subscriptionPlan: subscriptionPlan,
      external_reference: external_reference,
    });

  }

  // async updateUserSubscription(
  //   payerId: string,
  //   sub: Subscription,
  // ): Promise<void> {
  //   this.logger.log('Update subscription of payerID: ' + payerId);
  //   const subcriptionPlanId = sub.getSubscriptionPlan();
  //   const updateFields = { ...sub };

  //   // Realiza la actualización
  //   await this.subscriptionModel.findOneAndUpdate(
  //     { payerId: payerId },
  //     { subscriptionPlan: subcriptionPlanId },
  //     { $set: updateFields },
  //   );
  // }
}
