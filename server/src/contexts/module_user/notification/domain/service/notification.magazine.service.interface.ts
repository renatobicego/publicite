import { NotificationMagazine } from "../entity/notification.magazine.entity"

export interface NotificationMagazineServiceInterface {
    saveNotificationMagazineAndSentToUser(notificationGroup: NotificationMagazine): Promise<any>
}