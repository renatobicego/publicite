import { NotificationGroup } from "../entity/notification.group.entity"


export interface NotificationGroupServiceInterface {
    handleGroupNotificationAndCreateIt(notification: any): Promise<void>
    saveNotificationGroupAndSentToUserAndGroup(notificationGroup: NotificationGroup): Promise<any>
}