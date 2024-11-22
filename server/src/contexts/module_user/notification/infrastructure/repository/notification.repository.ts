import { NotificationRepositoryInterface } from "../../domain/repository/notification.repository.interface";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";

import { MyLoggerService } from "src/contexts/module_shared/logger/logger.service";
import { NotificationGroup } from "../../domain/entity/notification.group.entity";
import { INotificationGroup, NotificationGroupModel } from "../schemas/notification.group.schema";
import { NotificationMagazine } from "../../domain/entity/notification.magazine.entity";
import { INotificationMagazine, NotificationMagazineModel } from "../schemas/notification.magazine.schema";


export class NotificationRepository implements NotificationRepositoryInterface {

    constructor(
        private readonly logger: MyLoggerService,
        @InjectModel(NotificationGroupModel.modelName)
        private readonly notificationGroupDocument: Model<INotificationGroup>,
        @InjectModel(NotificationMagazineModel.modelName)
        private readonly notificationMagazineDocument: Model<INotificationMagazine>,

    ) {

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