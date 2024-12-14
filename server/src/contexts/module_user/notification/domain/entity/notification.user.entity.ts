import { Notification } from "./notification.entity";

export enum UserRelationType {
    topfriends = "topfriends",
    friends = "friends",
    contact = "contact"
}


export class NotificationUser extends Notification {
    private frontData: {
        userRelation: {
            _id: string;
            userFrom: {
                _id: string;
                username: string;
                profilePhotoUrl: string;
            };
            typeRelation: UserRelationType | null;
        }
    };

    constructor(
        notification: Notification,
        frontData: {
            userRelation: {
                _id: string;
                userFrom: {
                    _id: string;
                    username: string;
                    profilePhotoUrl: string;
                };
                typeRelation: UserRelationType | null;
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

    get getUserRelationId() {
        return this.frontData.userRelation._id;
    }

    get getFrontData() {
        return this.frontData
    }

    get getTypeOfRelation(): UserRelationType {
        return this.frontData.userRelation.typeRelation ?? UserRelationType.contact;
    }



}