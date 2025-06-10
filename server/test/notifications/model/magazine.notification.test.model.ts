import { Types } from "mongoose";
import { Notification_testing_model } from "./base.notification.test.model";

class NotificationMagazine_testing extends Notification_testing_model {
    frontData: {
        magazine: {
            _id?: string;
            name?: string;
            ownerType?: string;
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

}


export function createNotificationMagazine_testing(notificationMagazineRequest: NotificationMagazine_testing): NotificationMagazine_testing {
    const notificationMagazine: NotificationMagazine_testing = {
        _id: notificationMagazineRequest._id ?? new Types.ObjectId(),
        event: notificationMagazineRequest.event,
        viewed: notificationMagazineRequest.viewed ?? false,
        date: notificationMagazineRequest.date ?? new Date(),
        user: notificationMagazineRequest.user ?? "user",
        isActionsAvailable: notificationMagazineRequest.isActionsAvailable ?? true,
        backData: {
            userIdTo: notificationMagazineRequest.backData.userIdTo,
            userIdFrom: notificationMagazineRequest.backData.userIdFrom
        },
        socketJobId: notificationMagazineRequest.socketJobId ?? "socketJobId",
        type: notificationMagazineRequest.type ?? "magazine_notifications",
        notificationEntityId: notificationMagazineRequest.notificationEntityId ?? "notificationEntityId",
        previousNotificationId: notificationMagazineRequest.previousNotificationId ?? null,
        
        frontData: {
            magazine: {
                _id: notificationMagazineRequest.frontData.magazine._id ?? new Types.ObjectId().toString(),
                name: notificationMagazineRequest.frontData.magazine.name ?? "name",
                ownerType: notificationMagazineRequest.frontData.magazine.ownerType ?? "ownerType",
                groupInviting: {
                    _id: notificationMagazineRequest.frontData.magazine.groupInviting?._id ?? new Types.ObjectId().toString(),
                    name: notificationMagazineRequest.frontData.magazine.groupInviting?.name ?? "name",
                },
                userInviting: {
                    _id: notificationMagazineRequest.frontData.magazine.userInviting?._id ?? new Types.ObjectId().toString(),
                    username: notificationMagazineRequest.frontData.magazine.userInviting?.username ?? "username",
                }
            }
        }
    }

    return notificationMagazine
}