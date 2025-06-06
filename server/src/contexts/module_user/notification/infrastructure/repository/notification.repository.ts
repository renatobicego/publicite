import { NotificationRepositoryInterface } from '../../domain/repository/notification.repository.interface';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { MyLoggerService } from 'src/contexts/module_shared/logger/logger.service';
import { NotificationGroup } from '../../domain/entity/notification.group.entity';
import {
  INotificationGroup,
  NotificationGroupModel,
} from '../schemas/notification.group.schema';
import { NotificationMagazine } from '../../domain/entity/notification.magazine.entity';
import {
  INotificationMagazine,
  NotificationMagazineModel,
} from '../schemas/notification.magazine.schema';
import NotificationModel, {
  NotificationDocument,
} from '../schemas/notification.schema';
import { NotificationUser } from '../../domain/entity/notification.user.entity';
import {
  INotificationUser,
  NotificationUserModel,
} from '../schemas/notification.user.schema';
import { NotificationPost } from '../../domain/entity/notification.post.entity';
import {
  INotificationPost,
  NotificationPostModel,
} from '../schemas/notification.post.schema';
import { NotificationContactSeller } from '../../domain/entity/notification.contactSeller.entity';
import {
  INotificationContactSeller,
  NotificationContactSellerModel,
} from '../schemas/notification.contactSeller.schema';
import { NotificationPayment } from '../../domain/entity/notification.payment';
import {
  INotificationPayment,
  NotificationPaymentModel,
} from '../schemas/notification.payment.schema';
import { NotificationPostCalification } from '../../domain/entity/notification.postCalification.entity';
import { INotificationPostCalification, NotificationPostCalificationModel } from '../schemas/notification.postCalification.schema';
import { InternalServerErrorException } from '@nestjs/common';
import { INotificationShare, NotificationShareModel } from '../schemas/notification.share.schema';
import { NotificationShare } from '../../domain/entity/notification.share';
import { NotificationSubscription } from '../../domain/entity/notification.subscription.entity';
import { INotificationSubscription, NotificationSubscriptionModel } from '../schemas/notification.subscription.schema';

export class NotificationRepository implements NotificationRepositoryInterface {
  constructor(
    private readonly logger: MyLoggerService,
    @InjectModel(NotificationGroupModel.modelName)
    private readonly notificationGroupDocument: Model<INotificationGroup>,

    @InjectModel(NotificationMagazineModel.modelName)
    private readonly notificationMagazineDocument: Model<INotificationMagazine>,

    @InjectModel(NotificationModel.modelName)
    private readonly notificationBaseDocument: Model<NotificationDocument>,

    @InjectModel(NotificationUserModel.modelName)
    private readonly notificationUserDocument: Model<INotificationUser>,

    @InjectModel(NotificationPostModel.modelName)
    private readonly notificationPostDocument: Model<INotificationPost>,

    @InjectModel(NotificationContactSellerModel.modelName)
    private readonly notificationContactSellerModel: Model<INotificationContactSeller>,

    @InjectModel(NotificationPaymentModel.modelName)
    private readonly notificationPaymentModel: Model<INotificationPayment>,

    @InjectModel(NotificationPostCalificationModel.modelName)
    private readonly notificationPostCalificationDocument: Model<INotificationPostCalification>,

    @InjectModel(NotificationShareModel.modelName)
    private readonly notificationShareDocument: Model<INotificationShare>,

    @InjectModel(NotificationSubscriptionModel.modelName)
    private readonly notificationSubscriptionDocument: Model<INotificationSubscription>,
  ) { }




  async changeNotificationStatus(
    userRequestId: string,
    notificationId: string[],
    view: boolean,
  ): Promise<void> {
    try {
      this.logger.log(`Changing notification status for user ${userRequestId}`);

      await this.notificationBaseDocument.updateMany(
        {
          user: userRequestId,
          _id: { $in: notificationId },
        },
        {
          $set: { viewed: view },
        },
      );

      this.logger.log(
        `Successfully updated notification status for user ${userRequestId}`,
      );
    } catch (error: any) {
      this.logger.error(
        'Error while changing notification status:',
        error.message,
      );
      this.logger.error(error);
      throw error;
    }
  }

  async deleteAccount(id: string): Promise<void> {
    try {
      await this.notificationBaseDocument.deleteMany({
        $or: [{ user: id }, { 'backData.userIdFrom': id }]
      });
    } catch (error: any) {
      throw error;
    }
  }


  async deleteNotificationById(
    event: string,
    userRequestId: string,
    _id: string,
  ): Promise<void> {
    try {
      await this.notificationBaseDocument.deleteOne({
        _id,
        user: userRequestId,
        event,
      });
    } catch (error: any) {
      throw error;
    }
  }

  async getAllNotificationsFromUserById(
    id: string,
    limit: number,
    page: number,
  ): Promise<any> {
    try {
      const userNotificationResponse = await this.notificationBaseDocument
        .find({ user: id })
        .limit(limit + 1)
        .populate({
          path: 'frontData.contactSeller.post',
          model: 'Post',
          select:
            '_id title description frequencyPrice imagesUrls petitionType postType price toPrice',
        })
        .sort({ date: -1 })
        .skip((page - 1) * limit);

      if (!userNotificationResponse)
        return { notifications: [], hasMore: false };

      const hasMore = userNotificationResponse.length > page * limit;
      const notificationResponse: any = userNotificationResponse.slice(
        0,
        limit,
      );

      return {
        notifications: notificationResponse,
        hasMore: hasMore,
      };
    } catch (error: any) {
      throw error;
    }
  }

  async isThisNotificationDuplicate(
    notificationEntityId: string,
  ): Promise<boolean> {
    try {
      const notif_found = await this.notificationBaseDocument.exists({
        notificationEntityId,
      });

      if (notif_found) {
        return true;
      }
      return false;
    } catch (error: any) {
      throw error;
    }
  }

  async setNotificationActionsToFalseById(
    id: string,
    session: any,
  ): Promise<void> {
    try {
      const result = await this.notificationBaseDocument.updateOne(
        { _id: id },
        [
          {
            $set: {
              isActionsAvailable: false,
              notificationEntityId: {
                $concat: [
                  '$event',
                  '$backData.userIdTo',
                  '$backData.userIdFrom',
                  { $toString: false },
                ],
              },
            },
          },
        ],
        { session },
      );

    } catch (error: any) {
      throw error;
    }
  }

  async savePostNotification(
    notification: NotificationPost,
    session?: any,
  ): Promise<Types.ObjectId> {
    try {
      this.logger.log('Saving notification POST in repository...');
      this.logger.log(
        'Notification Type: ' + notification.getPostNotificationType,
      );
      const postNotification = new this.notificationPostDocument(notification);
      const postNotificationSaved = await postNotification.save({ session });
      return postNotificationSaved._id;
    } catch (error: any) {
      this.logger.error(
        'An error occurred while saving notification',
        error.message,
      );
      this.logger.error(error);
      throw error;
    }
  }

  async saveMagazineNotification(
    notification: NotificationMagazine,
    session?: any,
  ): Promise<Types.ObjectId> {
    try {
      this.logger.log('Saving notification Magazine in repository...');
      const magazineNotification = new this.notificationMagazineDocument(
        notification,
      );

      const magazineNotificationSave = await magazineNotification.save({
        session,
      });

      return magazineNotificationSave._id;
    } catch (error: any) {
      this.logger.error(
        'An error occurred while saving notification',
        error.message,
      );
      this.logger.error(error);
      throw error;
    }
  }

  async saveUserNotification(
    notification: NotificationUser,
    session?: any,
  ): Promise<Types.ObjectId> {
    try {
      this.logger.log('Saving notification in repository...');
      const userNotification = new this.notificationUserDocument(notification);

      const userNotificationSave = await userNotification.save({ session });

      return userNotificationSave._id;
    } catch (error: any) {
      this.logger.error(
        'An error occurred while saving notification',
        error.message,
      );
      this.logger.error(error);
      throw error;
    }
  }

  async saveShareNotification(notification: NotificationShare, session?: any): Promise<Types.ObjectId> {
    try {
      this.logger.log('Saving notification shared in repository...');
      const notificationShare = new this.notificationShareDocument(notification);
      const notificationShareSave = await notificationShare.save({ session });
      return notificationShareSave._id;

    } catch (error: any) {
      this.logger.error(
        'An error occurred while saving share notification',)
      throw error;
    }
  }
  async saveNotificationContactSeller(
    notification: NotificationContactSeller,
    session?: any,
  ): Promise<any> {
    try {
      this.logger.log('Saving notification in repository...');
      const contactSellerNotification = new this.notificationContactSellerModel(
        notification,
      );
      const contactSellerNotificationSave =
        await contactSellerNotification.save({ session });

      return contactSellerNotificationSave._id;
    } catch (error: any) {
      this.logger.error(
        'An error occurred while saving notification',
        error.message,
      );
      this.logger.error(error);
      throw error;
    }
  }

  async savePaymentNotification(
    notification: NotificationPayment,
    session?: any,
  ): Promise<any> {
    try {
      this.logger.log('Saving notification in repository...');
      const paymentNotification = new this.notificationPaymentModel(
        notification,
      );
      const paymentNotificationSave = await paymentNotification.save({
        session,
      });
      return paymentNotificationSave._id;
    } catch (error: any) {
      this.logger.error(
        'An error occurred while saving notification',
        error.message,
      );
      this.logger.error(error);
      throw error;
    }
  }


  async saveSubscriptionNotification(notification: NotificationSubscription, session?: any): Promise<Types.ObjectId> {
    try {
      this.logger.log('Saving notification  subscription in repository...');

      const subNotification = new this.notificationSubscriptionDocument(
        notification,
      );
      const subNotificationSaved = await subNotification.save({
        session,
      });
      return subNotificationSaved._id;
    } catch (error: any) {
      this.logger.error(
        'An error occurred while saving notification',
        error.message,
      );
      this.logger.error(error);
      throw error;
    }
  }


  async saveGroupNotification(
    notification: NotificationGroup,
    session?: any,
  ): Promise<Types.ObjectId> {
    try {
      this.logger.log('Saving notification in repository...');
      const groupNotification = new this.notificationGroupDocument(
        notification,
      );
      const groupNotificationSave = await groupNotification.save({ session });
      return groupNotificationSave._id;
    } catch (error: any) {
      this.logger.error(
        'An error occurred while saving notification',
        error.message,
      );
      this.logger.error(error);
      throw error;
    }
  }

  async saveRequestCalificationNotification(notification: NotificationPostCalification, session?: any): Promise<Types.ObjectId> {
    try {
      const notificationDocument = new this.notificationPostCalificationDocument(notification)
      const notifSaved = await notificationDocument.save({ session })
      if (!notifSaved || !notifSaved._id) throw new InternalServerErrorException("Error occurred, notifSaved is null");
      return notifSaved._id
    } catch (error: any) {
      throw error;
    }
  }
}
