import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId } from 'mongoose';

import { MyLoggerService } from 'src/contexts/shared/logger/logger.service';
import { SubscriptionDocument } from '../../schemas/mercadopago/subscription.schema';
import Subscription from 'src/contexts/webhook/domain/mercadopago/entity/subcription.entity';

import MercadoPagoEventsRepositoryInterface from 'src/contexts/webhook/domain/mercadopago/repository/mp-events.repository.interface';

export default class MercadoPagoEventsRepository
  implements MercadoPagoEventsRepositoryInterface
{
  constructor(
    private readonly logger: MyLoggerService,
    @InjectModel('Subscription')
    private readonly subscriptionModel: Model<SubscriptionDocument>,
  ) {}

  async findAllSubscriptions(): Promise<Subscription[]> {
    this.logger.log('Find all subscriptions');
    const subscriptions = await this.subscriptionModel.find().exec(); // Recupera todos los documentos
    console.log(subscriptions);
    return subscriptions.map((subscription) =>
      Subscription.fromDocument(subscription),
    );
  }

  async findStatusOfUserSubscription(
    payerId: string,
    subscriptionPlan: ObjectId,
    external_reference: string,
  ): Promise<Subscription | null> {
    this.logger.log(
      `Finding subscription status of  payerId: ${payerId} and subscriptionPlanid: ${subscriptionPlan} and external_reference: ${external_reference}`,
    );
    const userSubscription = await this.subscriptionModel.findOne({
      payerId,
      subscriptionPlan: subscriptionPlan,
      external_reference: external_reference,
    });
    return userSubscription
      ? Subscription.fromDocument(userSubscription)
      : null;
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
