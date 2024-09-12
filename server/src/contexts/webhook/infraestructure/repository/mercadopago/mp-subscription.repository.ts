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
  async updateSubscription(id: string, updateObject: any): Promise<void> {
    this.logger.log('Update subscription with ID: ' + id);
    const result = await this.subscriptionModel.findOneAndUpdate(
      { mpPreapprovalId: id },
      updateObject,
      { new: true },
    );
    if (!result) {
      this.logger.error(`Subscription with id ${id} not found.`);
      throw new Error(`Subscription with id ${id} not found.`);
    }
    this.logger.log(`Subscription with id ${id} successfully updated.`);
  }
  async cancelSubscription(id: string): Promise<void> {
    this.logger.log('Cancel subscription in repository: ' + id);
    this.logger.log(
      'If you need more information about this action, please check the ID ' +
        id,
    );
    const result = await this.subscriptionModel.findOneAndUpdate(
      { mpPreapprovalId: id },
      { status: 'cancelled' },
      { new: true },
    );
    if (!result) {
      this.logger.error(`Subscription with id ${id} not found.`);
      throw new Error(`Subscription with id ${id} not found.`);
    }
    this.logger.log(`Subscription with id ${id} successfully cancelled.`);
  }
  async saveSubPreapproval(sub: Subscription): Promise<void> {
    this.logger.log(
      'saving new subscription in database SUB_ID: ' + sub.getMpPreapprovalId(),
    );
    const newSubscription = new this.subscriptionModel(sub);
    await newSubscription.save();
  }

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
  async findSubscriptionByPreapprovalId(
    id: string,
  ): Promise<Subscription | null> {
    this.logger.log('Find subscription by preapproval ID: ' + id);
    const subscription = await this.subscriptionModel.findOne({
      mpPreapprovalId: id,
    }); // mpPreapprovalId es el campo de ID de SUSCRIPCION de MELI
    return subscription ? Subscription.fromDocument(subscription) : null;
  }
}
