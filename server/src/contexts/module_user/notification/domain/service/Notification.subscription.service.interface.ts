import { NotificationPayment } from "../entity/notification.payment";
import { NotificationSubscription } from "../entity/notification.subscription.entity";
import { NotificationProductionTicket } from "../entity/notification.productionTicket.entity";


export interface NotificationSubscriptionServiceInterface {
    createNotificationPaymentAndSendToUser(notificationPayment: NotificationPayment): Promise<void>;
    createNotificationSubscriptionAndSendToUser(notificationSubscription: NotificationSubscription): Promise<void>;
    createNotificationProductionTicketAndSendToUser(notificationProductionTicket: NotificationProductionTicket): Promise<void>;
}