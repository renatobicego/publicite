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
            },
            postResponse?: {
                author: string,
                commentId: string,
                response: string
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
                },
                postResponse?: {
                    author: string,
                    commentId: string,
                    response: string
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

    get getCommentResponse() {
        return this.frontData.postActivity.postResponse ?? {
            author: undefined,
            commentId: undefined,
            response: undefined
        }
    }
}