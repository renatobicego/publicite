import { NotificationSubscriptionServiceInterface } from "../../domain/service/Notification.subscription.service.interface";

export class NotificationSubscriptionService implements NotificationSubscriptionServiceInterface {


    async createNotificationAndSendToUser(notification: any): Promise<void> {
        try {
            throw new Error('Not implemented');
        } catch (error: any) {
            throw error;
        }
    }

}