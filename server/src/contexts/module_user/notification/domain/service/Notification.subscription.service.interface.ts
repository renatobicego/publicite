import { NotificationPayment } from "../entity/notification.payment";


export interface NotificationSubscriptionServiceInterface {
    createNotificationAndSendToUser(notificationPayment: NotificationPayment): Promise<void>;
}