import { Notification } from "./notification.entity";

export class NotificationGroup extends Notification {

    private frontData: {
        group: {
            _id: string;
            name: string;
            profilePhotoUrl: string;
            userInviting: {
                _id: string;
                username: string;
            };
        }
    };

    constructor(
        notification: Notification,
        frontData: {
            group: {
                _id: string;
                name: string;
                profilePhotoUrl: string;
                userInviting: {
                    _id: string;
                    username: string;
                };
            }
        }
    ) {
        super(notification.getEvent, notification.getViewed, notification.getDate, notification.getUser, notification.getIsActionsAvailable, notification.getbackData, notification.getSocketJobId, notification.getType);
        this.frontData = frontData;
    }

    get getGroupId() {
        return this.frontData.group._id
    }


}
