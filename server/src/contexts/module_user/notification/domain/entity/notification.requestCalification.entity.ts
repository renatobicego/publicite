import { PostCalificationEnum } from "./enum/postCalification.eum";
import { Notification } from "./notification.entity";

enum PostType {
    good = 'good',
    service = 'service',
}

export class NotificationPostCalification extends Notification {
    private frontData: {
        postCalification: {
            postCalificationType: PostCalificationEnum
            post: {
                _id: any
                title: string,
                author: string,
                description: string,
                imagesUrls: string[],
                postType: PostType
            }
            contactSeller_id: any
            review?: {
                author: any,
                review: string,
                date: Date,
                rating: number

            }
        }
    };


    constructor(notification: Notification,
        frontData: {
            postCalification: {
                postCalificationType: PostCalificationEnum
                post: {
                    _id: any
                    title: string,
                    author: string,
                    description: string
                    imagesUrls: string[],
                    postType: PostType
                }
                contactSeller_id: any
                review?: {
                    author: any,
                    review: string,
                    date: Date,
                    rating: number

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



    get getContactSellerId() {
        return this.frontData.postCalification.contactSeller_id
    }

    get getPostCalificationType() {
        return this.frontData.postCalification.postCalificationType
    }

    get getPostId() {
        return this.frontData.postCalification.post._id
    }
    get getReview() {
        return this.frontData.postCalification.review ?? null
    }

    get getMessageOfReview() {
        return this.frontData.postCalification.review?.review
    }

    get getRating() {
        return this.frontData.postCalification.review?.rating
    }

    get getPostType(){
        return this.frontData.postCalification.post.postType
    }
}