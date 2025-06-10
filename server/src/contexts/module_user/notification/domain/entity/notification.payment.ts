import { Notification } from "./notification.entity";


export class NotificationPayment extends Notification{
        private frontData: {
            subscriptionPlan:{
                _id:string,
                reason:string,
                status:string,
                retryAttemp:string,
            }
        };

        
    constructor(
        notification: Notification,
        frontData: {
            subscriptionPlan:{
                _id:string,
                reason:string,
                status:string,
                retryAttemp:string,
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
        );
        this.frontData = frontData;
    }
}