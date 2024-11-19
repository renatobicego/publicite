import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';


import { SubscriptionDocument } from '../schemas/subscription.schema';

import Subscription from 'src/contexts/module_webhook/mercadopago/domain/entity/subcription.entity';
import { MyLoggerService } from 'src/contexts/module_shared/logger/logger.service';
import { SubscriptionRepositoryInterface } from '../../domain/repository/mp-subscription.respository.interface';
import { getTodayDateTime } from 'src/contexts/module_shared/utils/functions/getTodayDateTime';


export class SubscriptionRepository implements SubscriptionRepositoryInterface {
  constructor(
    private readonly logger: MyLoggerService,
    @InjectModel('Subscription')
    private readonly subscriptionModel: Model<SubscriptionDocument>,
  ) { }


  async verifyIfSubscriptionWasPused(preapproval_id: string): Promise<boolean> {
    try {
      this.logger.log('Verify if subscription was pused in repository: ' + preapproval_id);
      this.logger.log(
        'If you need more information about this action, please check the ID ' +
        preapproval_id,
      );
      const result = await this.subscriptionModel.findOne({ mpPreapprovalId: preapproval_id, status: "paused" });

      if (result) {
        return true;
      } else {
        return false;
      }
    } catch (error: any) {
      throw error;
    }
  }

  async cancelSubscription(id: string): Promise<void> {
    try {
      this.logger.log('Cancel subscription in repository: ' + id);
      this.logger.log(
        'If you need more information about this action, please check the ID ' +
        id,
      );
      const timeOfUpdate = getTodayDateTime();
      const result = await this.subscriptionModel.findOneAndUpdate(
        { mpPreapprovalId: id },
        {
          status: 'cancelled',
          timeOfUpdate: timeOfUpdate,
        },
        { new: true },
      ).lean()
      if (!result) {
        this.logger.error(`Subscription with id ${id} not found.`);
        throw new Error(`Subscription with id ${id} not found.`);
      }
      this.logger.log(`Subscription with id ${id} successfully cancelled.`);
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

  async getSubscriptionHistory(
    external_reference: string,
  ): Promise<Subscription[]> {
    try {
      const subscriptions = await this.subscriptionModel
        .find({
          external_reference: external_reference,
        })
        .populate('subscriptionPlan');
      if (!subscriptions) return [];
      return subscriptions.map((subscription) => {
        return Subscription.fromDocument(subscription);
      });
    } catch (error: any) {
      throw error;
    }
  }


  async pauseSubscription(id: string, updateObject: any): Promise<void> {
    try {
      this.logger.log('Update subscription with ID: ' + id + 'STATUS: PAUSED');
      const result = await this.subscriptionModel.findOneAndUpdate(
        { mpPreapprovalId: id },
        updateObject,
        { new: true },
      ).lean()
      console.log('subscription paused: ');
      console.log(result);
      if (!result) {
        this.logger.error(`Subscription with id ${id} not found.`);
        throw new Error(`Subscription with id ${id} not found.`);
      }
      this.logger.log(`Subscription with id ${id} successfully updated.`);
    } catch (error: any) {
      throw error;
    }

  }

  async saveSubPreapproval(sub: Subscription): Promise<void> {
    this.logger.log(
      'saving new subscription in database SUB_ID: ' + sub.getMpPreapprovalId(),
    );
    const newSubscription = new this.subscriptionModel(sub);
    await newSubscription.save();
  }


  async updateSubscription(id: string, updateObject: any): Promise<void> {
    try {
      this.logger.log('Update subscription with ID: ' + id);
      const result = await this.subscriptionModel.findOneAndUpdate(
        { mpPreapprovalId: id },
        updateObject,
        { new: true },
      ).lean()
      if (!result) {
        this.logger.error(`Subscription with id ${id} not found.`);
        throw new Error(`Subscription with id ${id} not found.`);
      }
      this.logger.log(`Subscription with id ${id} successfully updated.`);
    } catch (error: any) {
      throw error;
    }
  }





}
