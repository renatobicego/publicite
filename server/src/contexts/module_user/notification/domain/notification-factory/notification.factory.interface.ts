import { typeOfNotification } from "../allowed-events/allowed.events.notifications";
import { Notification } from "../entity/notification.entity";




export interface NotificationFactoryInterface {
    createNotification(notificationType: typeOfNotification, notificationData: any): Notification
}