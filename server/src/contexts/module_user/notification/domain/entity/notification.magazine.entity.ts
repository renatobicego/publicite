import { Notification } from "./notification.entity";


export class NotificationMagazine extends Notification {
    private frontData: {
        magazine: {
            _id: string;
            name: string;
            ownerType: string;
            groupInviting?: {
                name: string;
            };
            userInviting?: {
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
                    name: string;
                };
                userInviting?: {
                    username: string;
                };
            }
        }
    ) {
        super(notification.getEvent, notification.getViewed, notification.getDate, notification.getUser, notification.getIsActionsAvailable, notification.getBackData);
        this.frontData = frontData;
    }

    get getFrontData() {
        return this.frontData
    }



}