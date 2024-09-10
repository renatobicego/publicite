import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { SubscriptionDocument } from '../../schemas/mercadopago/subscription.schema';
import { MyLoggerService } from 'src/contexts/shared/logger/logger.service';
import { SubscriptionRepositoryInterface } from 'src/contexts/webhook/domain/mercadopago/repository/mp-subscription.respository.interface';
import Subscription from 'src/contexts/webhook/domain/mercadopago/entity/subcription.entity';

export class SubscriptionRepository implements SubscriptionRepositoryInterface {
  constructor(
    private readonly logger: MyLoggerService,
    @InjectModel('Subscription')
    private readonly subscriptionModel: Model<SubscriptionDocument>,
  ) {}

  async getSubscriptionHistory(
    external_reference: string,
  ): Promise<Subscription[]> {
    try {
      const subscriptions = await this.subscriptionModel.find({
        external_reference: external_reference,
      });
      if (!subscriptions) return [];
      return subscriptions.map((subscription) => {
        return Subscription.fromDocument(subscription);
      });
    } catch (error: any) {
      throw error;
    }
  }
}
