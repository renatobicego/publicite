import { Notification } from "./notification.entity";

export class NotificationPost extends Notification {
    private frontData: {
        postReaction: {
            user: {
                username: string;
            },
            post: {
                postId: string;
                title: string;
                imageUrl: string;
            }
            emoji: string;
        }
    };


    constructor(notification: Notification,
        frontData: {
            postReaction: {
                user: {
                    username: string;
                },
                post: {
                    postId: string;
                    title: string;
                    imageUrl: string;
                }
                emoji: string;
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
}