import { NotificationPayment } from "../entity/notification.payment";
import { NotificationSubscription } from "../entity/notification.subscription.entity";


export interface NotificationSubscriptionServiceInterface {
    createNotificationPaymentAndSendToUser(notificationPayment: NotificationPayment): Promise<void>;
    createNotificationSubscriptionAndSendToUser(notificationSubscription: NotificationSubscription): Promise<void>;
}