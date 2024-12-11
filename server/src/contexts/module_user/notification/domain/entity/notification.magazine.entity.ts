import { Notification } from "./notification.entity";


export class NotificationMagazine extends Notification {
    private frontData: {
        magazine: {
            _id: string;
            name: string;
            ownerType: string;
            groupInviting?: {
                _id: string;
                name: string;
            };
            userInviting?: {
                _id: string;
                username: string;
            };
        }
    };

    constructor(
        notification: Notification,
        frontData: {
            magazine: {
                _id: string;
                name: string;
                ownerType: string;
                groupInviting?: {
                    _id: string;
                    name: string;
                };
                userInviting?: {
                    _id: string;
                    username: string;
                };
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

    get getFrontData() {
        return this.frontData
    }



}