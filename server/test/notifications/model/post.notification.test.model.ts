import { Notification_testing_model } from "./base.notification.test.model";




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


export function createNotificationPost_testing(notificationPostRequest: NotificationPost_testing) {
    const notificationPostTesting: NotificationPost_testing = {
        event: notificationPostRequest.event,
        viewed: notificationPostRequest.viewed ?? false,
        date: notificationPostRequest.date ?? new Date(),
        user: notificationPostRequest.user ?? "user",
        isActionsAvailable: notificationPostRequest.isActionsAvailable ?? true,
        backData: {
            userIdTo: notificationPostRequest.backData.userIdTo,
            userIdFrom: notificationPostRequest.backData.userIdFrom
        },
        socketJobId: notificationPostRequest.socketJobId ?? "socketJobId",
        type: notificationPostRequest.type,
        notificationEntityId: notificationPostRequest.notificationEntityId ?? "notificationEntityId",

        frontData: {
            postActivity: {
                notificationPostType: notificationPostRequest.frontData.postActivity.notificationPostType,
                user: {
                    username: notificationPostRequest.frontData.postActivity.user.username ?? "username",
                },
                post: {
                    _id: notificationPostRequest.frontData.postActivity.post._id,
                    title: notificationPostRequest.frontData.postActivity.post.title,
                    imageUrl: notificationPostRequest.frontData.postActivity.post.imageUrl,
                    postType: notificationPostRequest.frontData.postActivity.post.postType
                },
                postReaction: {
                    emoji: notificationPostRequest.frontData.postActivity.postReaction?.emoji
                },
                postComment: {
                    comment: notificationPostRequest.frontData.postActivity.postComment?.comment
                },
                postResponse: {
                    author: notificationPostRequest.frontData.postActivity.postResponse?.author,
                    commentId: notificationPostRequest.frontData.postActivity.postResponse?.commentId,
                    response: notificationPostRequest.frontData.postActivity.postResponse?.response
                }
            }


        }
    }

    return notificationPostTesting
}