import { NotificationRepositoryInterface } from "../../domain/repository/notification.repository.interface";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";

import { MyLoggerService } from "src/contexts/module_shared/logger/logger.service";
import { NotificationGroup } from "../../domain/entity/notification.group.entity";
import { INotificationGroup, NotificationGroupModel } from "../schemas/notification.group.schema";
import { NotificationMagazine } from "../../domain/entity/notification.magazine.entity";
import { INotificationMagazine, NotificationMagazineModel } from "../schemas/notification.magazine.schema";
import NotificationModel, { NotificationDocument } from "../schemas/notification.schema";
import { GROUP_notification_graph_model_get_all, Notification } from "../../application/dtos/getAll.notification.dto";
import { parseZonedDateTime } from "@internationalized/date";


export class NotificationRepository implements NotificationRepositoryInterface {

    constructor(
        private readonly logger: MyLoggerService,
        @InjectModel(NotificationGroupModel.modelName)
        private readonly notificationGroupDocument: Model<INotificationGroup>,
        @InjectModel(NotificationMagazineModel.modelName)
        private readonly notificationMagazineDocument: Model<INotificationMagazine>,
        @InjectModel(NotificationModel.modelName)
        private readonly notificationBaseDocument: Model<NotificationDocument>,

    ) { }


    async changeNotificationStatus(userRequestId: string, notificationId: string[], view: boolean): Promise<void> {
        try {
            this.logger.log(`Changing notification status for user ${userRequestId}`);

            await this.notificationBaseDocument.updateMany(
                {
                    user: userRequestId,
                    _id: { $in: notificationId }
                },
                {
                    $set: { viewed: view }
                }
            );

            this.logger.log(`Successfully updated notification status for user ${userRequestId}`);
        } catch (error: any) {
            this.logger.error('Error while changing notification status:', error.message);
            this.logger.error(error);
            throw error;
        }
    }




    async getAllNotificationsFromUserById(
        id: string,
        limit: number,
        page: number,
    ): Promise<GROUP_notification_graph_model_get_all> {
        try {
            const userNotificationResponse =
                await this.notificationBaseDocument
                    .find({ user: id })
                    .limit(limit + 1)
                    .skip((page - 1) * limit)

            if (!userNotificationResponse)
                return { notifications: [], hasMore: false };


            const notificationsSorted = userNotificationResponse
                .map((notif: any) => {
                    return new Notification(
                        notif._id,
                        notif.event,
                        notif.viewed,
                        notif.date,
                        notif.user,
                        notif.isActionsAvailable,
                        notif.backData,
                        notif.frontData
                    );
                })
                .sort((notificationA: any, notificationB: any) => {

                    const dateA = parseZonedDateTime(notificationA.date).toDate();
                    const dateB = parseZonedDateTime(notificationB.date).toDate();

                    return dateB.getTime() - dateA.getTime();
                });

            const hasMore = notificationsSorted.length > page * limit;
            const notificationResponse = notificationsSorted.slice(0, limit);
            return {
                notifications: notificationResponse,
                hasMore: hasMore,
            };
        } catch (error: any) {
            throw error;
        }
    }


    async setNotificationActionsToFalseById(id: string, session: any): Promise<void> {
        try {
            await this.notificationBaseDocument.updateOne({ _id: id },
                { $set: { isActionsAvailable: false } }, { session });
        } catch (error: any) {
            throw error;
        }

    }

    async saveMagazineNotification(notification: NotificationMagazine, session?: any): Promise<Types.ObjectId> {
        try {
            this.logger.log('Saving notification in repository...');
            const magazineNotification = new this.notificationMagazineDocument(notification);

            const magazineNotificationSave = await magazineNotification.save({ session });

            return magazineNotificationSave._id;
        } catch (error: any) {
            this.logger.error('An error occurred while saving notification', error.message);
            this.logger.error(error)
            throw error;
        }
    }


    async saveGroupNotification(notification: NotificationGroup, session?: any): Promise<Types.ObjectId> {
        try {
            this.logger.log('Saving notification in repository...');
            const groupNotification = new this.notificationGroupDocument(notification);
            const groupNotificationSave = await groupNotification.save({ session });
            return groupNotificationSave._id;
        } catch (error: any) {
            this.logger.error('An error occurred while saving notification', error.message);
            this.logger.error(error)
            throw error;
        }
    }


}