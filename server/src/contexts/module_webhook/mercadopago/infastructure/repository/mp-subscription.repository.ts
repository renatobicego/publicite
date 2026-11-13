import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { SubscriptionDocument } from '../schemas/subscription.schema';
import Subscription from 'src/contexts/module_webhook/mercadopago/domain/entity/subcription.entity';
import { MyLoggerService } from 'src/contexts/module_shared/logger/logger.service';
import { SubscriptionRepositoryInterface } from '../../domain/repository/mp-subscription.respository.interface';
import { getTodayDateTime } from 'src/contexts/module_shared/utils/functions/getTodayDateTime';
import { IUser } from 'src/contexts/module_user/user/infrastructure/schemas/user.schema';
import { activeSubscriptionMatch } from 'src/contexts/module_shared/subscriptions/active-subscription.match';
import { MP_BACKED_SUBSCRIPTION_KINDS } from 'src/contexts/module_shared/subscriptions/subscription.kind';

export class SubscriptionRepository implements SubscriptionRepositoryInterface {
  constructor(
    private readonly logger: MyLoggerService,
    @InjectModel('Subscription')
    private readonly subscriptionModel: Model<SubscriptionDocument>,
    @InjectModel('User')
    private readonly userModel: Model<IUser>,
  ) {}

  async cancelSubscription(id: string): Promise<void> {
    try {
      this.logger.log('Cancel subscription in repository: ' + id);
      this.logger.log(
        'If you need more information about this action, please check the ID ' +
          id,
      );
      const timeOfUpdate = getTodayDateTime();
      const result = await this.subscriptionModel
        .findOneAndUpdate(
          { mpPreapprovalId: id },
          {
            status: 'cancelled',
            timeOfUpdate: timeOfUpdate,
          },
          { new: true },
        )
        .lean();
      if (!result) {
        this.logger.error(`Subscription with id ${id} not found.`);
        throw new Error(`Subscription with id ${id} not found.`);
      }
      this.logger.log(`Subscription with id ${id} successfully cancelled.`);
    } catch (error: any) {
      throw error;
    }
  }

  async findSubscriptionByPreapprovalId(id: string): Promise<any> {
    this.logger.log('Find subscription by preapproval ID: ' + id);
    const subscription = await this.subscriptionModel.findOne({
      mpPreapprovalId: id,
    });
    return subscription;
  }

  /*
  Suscripciones no canceladas del usuario (y no vencidas, en las temporales). Lee
  las que tiene en `User.subscriptions` (así ve las compartidas y las regaladas)
  y, por compatibilidad, las que tienen su mongoId como `external_reference` y el
  plan gratuito compartido, que es lo que devolvía antes.
  */
  async getSubscriptionHistory(userId: string): Promise<any[]> {
    try {
      const user: any = await this.userModel
        .findById(userId)
        .select('subscriptions')
        .lean();
      const ownIds = user?.subscriptions ?? [];
      const subscriptions = await this.subscriptionModel
        .find({
          status: { $ne: 'cancelled' },
          $and: [
            {
              $or: [
                { _id: { $in: ownIds } },
                { external_reference: userId },
                { external_reference: 'FREE' },
              ],
            },
            { $or: [{ expiresAt: null }, { expiresAt: { $gt: new Date() } }] },
          ],
        })
        .populate([
          {
            path: 'subscriptionPlan',
            model: 'SubscriptionPlan',
          },
        ]);
      if (!subscriptions) return [];
      return subscriptions;
    } catch (error: any) {
      throw error;
    }
  }

  /*
  Suscripciones activas de las que el usuario es titular (las de su
  `User.subscriptions`, incluido el plan gratuito compartido), con el plan
  populado. Es la fuente de "qué tiene el usuario": la usan el chequeo de
  downgrade y los checkouts.
  */
  async getActiveSubscriptions(userId: string): Promise<any[]> {
    try {
      const user: any = await this.userModel
        .findById(userId)
        .select('subscriptions')
        .populate({
          path: 'subscriptions',
          model: 'Subscription',
          match: activeSubscriptionMatch(),
          populate: { path: 'subscriptionPlan', model: 'SubscriptionPlan' },
        })
        .lean();
      return (user?.subscriptions ?? []).filter(Boolean);
    } catch (error: any) {
      throw error;
    }
  }

  /*
  Suscripciones activas con preapproval en MP que paga el usuario. Se busca en la
  colección y no en `User.subscriptions` porque se usa al borrar la cuenta, cuando
  el documento del usuario puede no existir más.
  */
  async getActiveMpSubscriptionsPaidBy(userId: string): Promise<any[]> {
    try {
      const subscriptions = await this.subscriptionModel
        .find({
          ...activeSubscriptionMatch(),
          $and: [
            { $or: [{ payerUser: userId }, { external_reference: userId }] },
            { $or: [{ kind: null }, { kind: { $in: MP_BACKED_SUBSCRIPTION_KINDS } }] },
          ],
        })
        .lean();
      return subscriptions ?? [];
    } catch (error: any) {
      throw error;
    }
  }

  async pauseSubscription(id: string, updateObject: any): Promise<void> {
    try {
      this.logger.log('Update subscription with ID: ' + id + 'STATUS: PAUSED');
      const result = await this.subscriptionModel
        .findOneAndUpdate({ mpPreapprovalId: id }, updateObject, { new: true })
        .lean();
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

  async pendingSubscription(id: string, updateObject: any): Promise<void> {
    try {
      this.logger.log('Update subscription with ID: ' + id + 'STATUS: PENDING');
      const result = await this.subscriptionModel
        .findOneAndUpdate({ mpPreapprovalId: id }, updateObject, { new: true })
        .lean();
      console.log('subscription Pending: ');
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

  async saveSubPreapproval(sub: Subscription, session: any): Promise<any> {
    this.logger.log(
      'saving new subscription in database SUB_ID: ' + sub.getMpPreapprovalId(),
    );
    const newSubscription = new this.subscriptionModel(sub);
    const subSaved = await newSubscription.save({ session });
    if (subSaved && subSaved._id) return subSaved._id;
  }

  async updateSubscription(id: string, updateObject: any): Promise<void> {
    try {
      this.logger.log(
        'Update subscription with ID: ' + id + 'STATUS: authorized',
      );
      const result = await this.subscriptionModel
        .findOneAndUpdate({ mpPreapprovalId: id }, updateObject, { new: true })
        .lean();
      if (!result) {
        this.logger.error(`Subscription with id ${id} not found.`);
        throw new Error(`Subscription with id ${id} not found.`);
      }
      this.logger.log(`Subscription with id ${id} successfully updated.`);
    } catch (error: any) {
      throw error;
    }
  }

  async updateSubscriptionStatus(id: string, statusObj: any): Promise<void> {
    try {
      this.logger.log(
        'Update subscription with ID: ' + id + 'STATUS: ' + statusObj.status,
      );
      const result = await this.subscriptionModel
        .findOneAndUpdate({ mpPreapprovalId: id }, statusObj, { new: true })
        .lean();
      if (!result) {
        this.logger.error(`Subscription with id ${id} not found.`);
        throw new Error(`Subscription with id ${id} not found.`);
      }
      this.logger.log(`Subscription with id ${id} successfully updated.`);
    } catch (error: any) {
      throw error;
    }
  }

  async verifyIfSubscriptionWasPused(preapproval_id: string): Promise<boolean> {
    try {
      this.logger.log(
        'Verify if subscription was pused in repository: ' + preapproval_id,
      );
      this.logger.log(
        'If you need more information about this action, please check the ID ' +
          preapproval_id,
      );
      const result = await this.subscriptionModel.findOne({
        mpPreapprovalId: preapproval_id,
        status: 'paused',
      });

      if (result) {
        return true;
      } else {
        return false;
      }
    } catch (error: any) {
      throw error;
    }
  }
}
