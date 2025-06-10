import { NotificationShare } from "../entity/notification.share";

export interface NotificationShareServiceInterface {
    createNotificationShareAndSendToUser(notificationShare: NotificationShare): Promise<void>;

}