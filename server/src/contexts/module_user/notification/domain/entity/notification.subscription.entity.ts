import { Notification } from "./notification.entity";


export class NotificationSubscription extends Notification {
    private frontData: {
        subscription: {
            event: string
        }
    };



    constructor(notification: Notification,
        frontData: {
            subscription: {
                event: string
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

}