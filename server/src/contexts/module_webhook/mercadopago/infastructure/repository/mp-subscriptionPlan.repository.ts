import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';

import { SubscriptionPlanDocument } from '../schemas/subscriptionPlan.schema';
import { MyLoggerService } from 'src/contexts/module_shared/logger/logger.service';
import { SubscriptionPlan } from 'src/contexts/module_webhook/mercadopago/domain/entity/subscriptionPlan.entity';
import { MercadoPagoSubscriptionPlanRepositoryInterface } from '../../domain/repository/mp-subscriptionPlan.repository.interface';

export class MercadoPagoSubscriptionPlanRepository
  implements MercadoPagoSubscriptionPlanRepositoryInterface
{
  constructor(
    private readonly logger: MyLoggerService,
    @InjectModel('SubscriptionPlan')
    private readonly subscriptionPlanModel: Model<SubscriptionPlanDocument>,
  ) {}

  async findSubscriptionPlanByMeliID(
    id: string,
  ): Promise<SubscriptionPlan | null> {
    this.logger.log('Find subscription plan by Meli ID: ' + id);
    const subscriptionPlanDocument = await this.subscriptionPlanModel
      .findOne({ mpPreapprovalPlanId: id })
      .lean();
    return subscriptionPlanDocument
      ? SubscriptionPlan.fromDocument(subscriptionPlanDocument)
      : null;
  }
  async findAllSubscriptionPlans(): Promise<SubscriptionPlan[]> {
    try {
      this.logger.log('Find all subscription plans in repository');
      return this.subscriptionPlanModel
        .find({ isActive: true })
        .then((subscriptionPlans) => {
          this.logger.log('Transforming subscription plans in repository');
          return subscriptionPlans.map((subscriptionPlan) =>
            SubscriptionPlan.fromDocument(subscriptionPlan),
          );
        });
    } catch (error: any) {
      this.logger.error(error);
      this.logger.error(
        'An error was ocurred in -> Class:MercadoPagoSubscriptionPlanRepository',
        error.message ?? '',
      );
      throw error;
    }
  }
}
