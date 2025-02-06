import { NotificationPostCalification } from "../entity/notification.requestCalification.entity";


export interface NotificationRequestCalificationServiceInterface {
    createNotificatioRequestCalificationAndSendToUser(notificationRequestCalification: NotificationPostCalification): Promise<any>;
    createNotificationResponseCalificationAndSendToUser(notificationRequestCalification: NotificationPostCalification): Promise<any>;
}