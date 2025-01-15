import { NotificationPostType } from "./enum/notification.post.type.enum";
import { Notification } from "./notification.entity";

export class NotificationPostComment extends Notification {
      private frontData: {
            postActivity: {
                notificationPostType: NotificationPostType
                user: {
                    username: string;
                },
                post: {
                    _id: string;
                    title: string;
                    imageUrl: string;
                    postType: string;
                    comment: string;
                }
            }
        };
    
    
        constructor(notification: Notification,
            frontData: {
                postActivity: {
                    notificationPostType: NotificationPostType
                    user: {
                        username: string;
                    },
                    post: {
                        _id: string;
                        title: string;
                        imageUrl: string;
                        postType: string;
                        comment: string;
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

        
    get getPostNotificationType(){
        return this.frontData.postActivity.notificationPostType
    } 
    
    get getPostId() {
        return this.frontData.postActivity.post._id;
    }

    get getComment() {
        return this.frontData.postActivity.post.comment;
    }
    
}