import { Types } from "mongoose";
import { Notification_testing_model } from "./base.notification.test.model";



export enum UserRelationType_testing {
    topfriends = "topfriends",
    friends = "friends",
    contacts = "contacts"
}

class NotificationPost_testing extends Notification_testing_model {
    frontData: {
        userRelation: {
            _id: string;
            userFrom: {
                _id: string;
                username: string;
                profilePhotoUrl: string;
            };
            typeRelation: UserRelationType_testing | null;
        }
    };
}


export function createNotification_user(notificationUser: NotificationPost_testing) {
    const notificationPostTesting: NotificationPost_testing = {
        _id: notificationUser._id ?? new Types.ObjectId(),
        event: notificationUser.event,
        viewed: notificationUser.viewed ?? false,
        date: notificationUser.date ?? new Date(),
        user: notificationUser.user ?? "user",
        isActionsAvailable: notificationUser.isActionsAvailable ?? true,
        backData: {
            userIdTo: notificationUser.backData.userIdTo,
            userIdFrom: notificationUser.backData.userIdFrom
        },
        socketJobId: notificationUser.socketJobId ?? "socketJobId",
        type: notificationUser.type,
        notificationEntityId: notificationUser.notificationEntityId ?? "notificationEntityId",
        previousNotificationId: notificationUser.previousNotificationId ?? null,
        frontData: {
            userRelation: {
                _id: notificationUser.frontData.userRelation._id ?? "_id",
                userFrom: {
                    _id: notificationUser.frontData.userRelation.userFrom._id ?? "_id",
                    username: notificationUser.frontData.userRelation.userFrom.username,
                    profilePhotoUrl: notificationUser.frontData.userRelation.userFrom.profilePhotoUrl
                },
                typeRelation: notificationUser.frontData.userRelation.typeRelation ?? null

            }


        }
    }

    return notificationPostTesting
}

export default createNotification_user