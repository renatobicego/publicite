import { NotificationPost } from "../entity/notification.post.entity"

export interface NotificationPostServiceInterface {
    saveNotificationPostReactionAndSendToUser(notificationPost: NotificationPost): Promise<void>
    saveNotificationPostCommentAndSendToUser(notificationPostComment: NotificationPost): Promise<any>
    saveNotificationPostResponseAndSendToUser(notificationPostResponse: NotificationPost): Promise<void>

}