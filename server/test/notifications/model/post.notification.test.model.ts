import { Notification_testing_model } from "./base.notification.test.module";




export enum NotificationPostType_testing {
    reaction = 'reaction',
    comment = 'comment',
    response = 'response'
}

class NotificationPost_testing extends Notification_testing_model {
    frontData: {
        postActivity: {
            notificationPostType: NotificationPostType_testing,
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
                emoji?: string;
            }
            postComment?: {
                comment?: string
            },
            postResponse?: {
                author?: string,
                commentId?: string,
                response?: string
            }
        }

    }
}


export function createNotificationPost_testing(notificationPost: NotificationPost_testing) {
    const notificationPostTesting: NotificationPost_testing = {
        event: notificationPost.event,
        viewed: notificationPost.viewed ?? false,
        date: notificationPost.date ?? new Date(),
        user: notificationPost.user ?? "user",
        isActionsAvailable: notificationPost.isActionsAvailable ?? true,
        backData: {
            userIdTo: notificationPost.backData.userIdTo,
            userIdFrom: notificationPost.backData.userIdFrom
        },
        socketJobId: notificationPost.socketJobId ?? "socketJobId",
        type: notificationPost.type,
        notificationEntityId: notificationPost.notificationEntityId ?? "notificationEntityId",

        frontData: {
            postActivity: {
                notificationPostType: notificationPost.frontData.postActivity.notificationPostType,
                user: {
                    username: notificationPost.frontData.postActivity.user.username ?? "username",
                },
                post: {
                    _id: notificationPost.frontData.postActivity.post._id,
                    title: notificationPost.frontData.postActivity.post.title,
                    imageUrl: notificationPost.frontData.postActivity.post.imageUrl,
                    postType: notificationPost.frontData.postActivity.post.postType
                },
                postReaction: {
                    emoji: notificationPost.frontData.postActivity.postReaction?.emoji
                },
                postComment: {
                    comment: notificationPost.frontData.postActivity.postComment?.comment
                },
                postResponse: {
                    author: notificationPost.frontData.postActivity.postResponse?.author,
                    commentId: notificationPost.frontData.postActivity.postResponse?.commentId,
                    response: notificationPost.frontData.postActivity.postResponse?.response
                }
            }


        }
    }

    return notificationPostTesting
}