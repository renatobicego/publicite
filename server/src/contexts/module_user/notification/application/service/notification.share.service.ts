import { Inject, InternalServerErrorException } from "@nestjs/common";
import { Connection } from "mongoose";
import { InjectConnection } from "@nestjs/mongoose";



import { UserServiceInterface } from "src/contexts/module_user/user/domain/service/user.service.interface";
import { NotificationShare } from "../../domain/entity/notification.share";
import { NotificationRepositoryInterface } from "../../domain/repository/notification.repository.interface";
import { NotificationShareServiceInterface } from "../../domain/service/notification.share.service.interface";

export class NotificationShareService implements NotificationShareServiceInterface {

    constructor(
        @InjectConnection()
        private readonly connection: Connection,
        @Inject('NotificationRepositoryInterface')
        private readonly notificationRepository: NotificationRepositoryInterface,
        @Inject('UserServiceInterface')
        private readonly userService: UserServiceInterface,
    ) {

    }

    async createNotificationShareAndSendToUser(notificationShare: NotificationShare): Promise<void> {
        const session = await this.connection.startSession();
        try {
            const userIdFrom = notificationShare.getbackData.userIdFrom;
            const userIdTo = notificationShare.getbackData.userIdTo;
            await session.withTransaction(async () => {
                const notificationId = await this.notificationRepository.saveShareNotification(notificationShare, session);
                if (!notificationId) throw new InternalServerErrorException("Error was ocurred, notificationId is null - saveShareNotification")
                await this.userService.pushNotificationToUserArrayNotifications(notificationId, userIdTo, userIdFrom, session);
            })


        } catch (error: any) {
            throw error;
        } finally {
            session.endSession();
        }
    }

}