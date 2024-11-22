import { NotificationMagazine } from "../entity/notification.magazine.entity"

export interface NotificationMagazineServiceInterface {
    handleMagazineNotificationAndCreateIt(notificationBody: any): Promise<void>
    saveNotificationMagazineAndSentToUser(notificationGroup: NotificationMagazine): Promise<any>

}