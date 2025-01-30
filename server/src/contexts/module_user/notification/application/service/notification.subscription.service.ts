import { Inject } from "@nestjs/common";

import { UserServiceInterface } from "src/contexts/module_user/user/domain/service/user.service.interface";
import { NotificationRepositoryInterface } from "../../domain/repository/notification.repository.interface";
import { NotificationSubscriptionServiceInterface } from "../../domain/service/Notification.subscription.service.interface";
import { NotificationPayment } from "../../domain/entity/notification.payment";

export class NotificationSubscriptionService implements NotificationSubscriptionServiceInterface {

    constructor(
        @Inject('NotificationRepositoryInterface')
        private readonly notificationRepository: NotificationRepositoryInterface,
        @Inject('UserServiceInterface')
        private readonly userService: UserServiceInterface,


    ) {

    }



    async createNotificationAndSendToUser(notificationPayment: NotificationPayment): Promise<void> {
        try {
            const notificationId = await this.notificationRepository.savePaymentNotification(notificationPayment);
            const userIdFrom = notificationPayment.getbackData.userIdFrom;
            const userIdTo = notificationPayment.getbackData.userIdTo;

            return await this.userService.pushNotificationToUserArrayNotifications(notificationId, userIdTo, userIdFrom);
        } catch (error: any) {
            throw error;
        }
    }

}