import { Notification } from "./notification.entity";

export class NotificationGroup extends Notification {
    private frontData: {
        group: {
            _id: string;
            name: string;
            profilePhotoUrl: string;
            userInviting: {
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
                    username: string;
                };
            }
        }
    ) {
        super(notification.getEvent, notification.getViewed, notification.getDate, notification.getUser, notification.getIsActionsAvailable, notification.getBackData);
        this.frontData = frontData;
    }

    get getGroupId() {
        return this.frontData.group._id
    }


}
