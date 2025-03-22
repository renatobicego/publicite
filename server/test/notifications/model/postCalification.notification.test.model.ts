import { Notification_testing_model } from "./base.notification.test.model";

enum PostType {
    good = 'good',
    service = 'service',
}


enum PostCalificationEnum {
    request = 'request',
    response = 'response',
}

class NotificationPostCalification_testing extends Notification_testing_model {
    frontData: {
        postCalification: {
            postCalificationType: PostCalificationEnum
            post?: {
                _id?: any
                title?: string,
                author?: string,
                description?: string,
                imagesUrls?: string[],
                postType?: any
            }
            contactSeller_id?: any
            review: {
                author: any,
                review: string,
                date: Date,
                rating: number
            } | null
        }
    }
}

export function createNotificationPostCalification_testing(notificationRequest: NotificationPostCalification_testing) {
    const notificationPostCalificationTesting: NotificationPostCalification_testing = {
        event: notificationRequest.event,
        viewed: notificationRequest.viewed ?? false,
        date: notificationRequest.date ?? new Date(),
        user: notificationRequest.user ?? "user",
        isActionsAvailable: notificationRequest.isActionsAvailable ?? true,
        backData: {
            userIdTo: notificationRequest.backData.userIdTo,
            userIdFrom: notificationRequest.backData.userIdFrom
        },
        socketJobId: notificationRequest.socketJobId ?? "socketJobId",
        type: notificationRequest.type,
        notificationEntityId: notificationRequest.notificationEntityId ?? "notificationEntityId",
        previousNotificationId: notificationRequest.previousNotificationId ?? null,
        frontData: {
            postCalification: {
                postCalificationType: notificationRequest.frontData.postCalification.postCalificationType,
                post: {
                    _id: notificationRequest.frontData.postCalification.post?._id ?? "post_id",
                    title: notificationRequest.frontData.postCalification.post?.title ?? "title",
                    author: notificationRequest.frontData.postCalification.post?.author ?? "author",
                    description: notificationRequest.frontData.postCalification.post?.description ?? "description",
                    imagesUrls: notificationRequest.frontData.postCalification.post?.imagesUrls ?? ["imagesUrls"],
                    postType: notificationRequest.frontData.postCalification.post?.postType ?? PostType.good
                },
                contactSeller_id: notificationRequest.frontData.postCalification.contactSeller_id,
                review: notificationRequest.frontData.postCalification.review ?? null
            }
        }
    }

    return notificationPostCalificationTesting
}


export default createNotificationPostCalification_testing