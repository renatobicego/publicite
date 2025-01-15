import { typeOfNotification } from "../allowed-events/allowed.events.notifications";
import { NotificationPostType } from "../entity/enum/notification.post.type.enum";
import { Notification } from "../entity/notification.entity";




export interface NotificationFactoryInterface {
    createNotification(notificationType: typeOfNotification, notificationData: any, notificationPostType?:NotificationPostType): Notification
}