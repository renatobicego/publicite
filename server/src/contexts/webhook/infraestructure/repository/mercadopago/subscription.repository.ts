import { SubscriptionRepositoryInterface } from 'src/contexts/webhook/domain/mercadopago/repository/subscription.respository.interface';
import { SubscriptionResponse } from '../../controllers/response/subscription.response';
import { InjectModel } from '@nestjs/mongoose';
import { SubscriptionDocument } from '../../schemas/mercadopago/subscription.schema';
import { Model } from 'mongoose';
import { MyLoggerService } from 'src/contexts/shared/logger/logger.service';

export class SubscriptionRepository implements SubscriptionRepositoryInterface {
  constructor(
    private readonly logger: MyLoggerService,
    @InjectModel('Subscription')
    private readonly subscriptionModel: Model<SubscriptionDocument>,
  ) {}

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
