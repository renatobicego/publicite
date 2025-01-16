import { NotificationPostType } from "./enum/notification.post.type.enum";
import { Notification } from "./notification.entity";

export class NotificationPost extends Notification {
    private frontData: {
        postActivity: {
            notificationPostType: NotificationPostType,
            user: {
                username: string;
            },
            post: {
                _id: string;
                title: string;
                imageUrl: string;
                postType: string;
            },
            postReaction?: {
                emoji: string;
            }
            postComment?: {
                comment: string
            }
        }
    };


    constructor(notification: Notification,
        frontData: {
            postActivity: {
                notificationPostType: NotificationPostType,
                user: {
                    username: string;
                },
                post: {
                    _id: string;
                    title: string;
                    imageUrl: string;
                    postType: string;
                }
                postReaction?: {
                    emoji: string;
                },
                postComment?: {
                    comment: string
                }
            }

        }
    ) {
        super(notification.getEvent,
            notification.getViewed,
            notification.getDate,
            notification.getUser,
            notification.getIsActionsAvailable,
            notification.getbackData,
            notification.getSocketJobId,
            notification.getType,
            notification.getNotificationEntityId,
            notification.getpreviousNotificationId as string
        )
        this.frontData = frontData
    }

    get getFrontData() {
        return this.frontData
    }

    get getPostId() {
        return this.frontData.postActivity.post._id
    }
    get getPostReactionEmoji() {
        return this.frontData.postActivity.postReaction?.emoji
    }

    get getPostNotificationType() {
        return this.frontData.postActivity.notificationPostType
    }

    get getComment() {
        return this.frontData.postActivity.postComment?.comment
    }
}