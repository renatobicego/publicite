import { NotificationPostCalification } from "../entity/notification.postCalification.entity";


export interface NotificationRequestCalificationServiceInterface {
    createNotificatioRequestCalificationAndSendToUser(notificationRequestCalification: NotificationPostCalification): Promise<any>;
    createNotificationResponseCalificationAndSendToUser(notificationRequestCalification: NotificationPostCalification): Promise<any>;
}