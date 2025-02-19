import { ShareTypesEnum } from "./enum/notification.share.enum";
import { Notification } from "./notification.entity";


export class NotificationShare extends Notification {
    private frontData: {
        share: {
            type: ShareTypesEnum,
            _id: string,
            description: string
            username: string,
            imageUrl?: string
        }
    };



    constructor(notification: Notification,
        frontData: {
            share: {
                type: ShareTypesEnum,
                _id: string,
                description: string
                username: string,
                imageUrl?: string
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