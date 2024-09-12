import { MyLoggerService } from 'src/contexts/shared/logger/logger.service';
import { SubscriptionPlan } from 'src/contexts/webhook/domain/mercadopago/entity/subscriptionPlan.entity';
import { MercadoPagoSubscriptionPlanRepositoryInterface } from 'src/contexts/webhook/domain/mercadopago/repository/mp-subscriptionPlan.repository.interface';
import { SubscriptionPlanDocument } from '../../schemas/mercadopago/subscriptionPlan.schema';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';

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
      .exec();
    return subscriptionPlanDocument
      ? SubscriptionPlan.fromDocument(subscriptionPlanDocument)
      : null;
  }
  async findAllSubscriptionPlans(): Promise<SubscriptionPlan[]> {
    try {
      this.logger.log('Find all subscription plans in repository');
      return this.subscriptionPlanModel.find().then((subscriptionPlans) => {
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
