import { Types } from "mongoose";
import { Notification_testing_model } from "./base.notification.test.model";

class NotificationContactSellerRequest extends Notification_testing_model {
    frontData: {
        contactSeller?: {
            post?: any;
            client?: {
                clientId?: string;
                name?: string;
                email?: string;
                lastName?: string;
                username?: string;
                phone?: string;
                message?: string;
            };
        };
    };

}


export function createNotificationContactSeller_testing(notificationContactSellerRequest: NotificationContactSellerRequest): NotificationContactSellerRequest {
    const notificationContactSeller: NotificationContactSellerRequest = {
        _id: notificationContactSellerRequest._id ?? new Types.ObjectId(),
        event: notificationContactSellerRequest.event,
        viewed: notificationContactSellerRequest.viewed ?? false,
        date: notificationContactSellerRequest.date ?? new Date(),
        user: notificationContactSellerRequest.user ?? "user",
        isActionsAvailable: notificationContactSellerRequest.isActionsAvailable ?? true,
        backData: {
            userIdTo: notificationContactSellerRequest.backData.userIdTo,
            userIdFrom: notificationContactSellerRequest.backData.userIdFrom
        },
        socketJobId: notificationContactSellerRequest.socketJobId ?? "socketJobId",
        type: notificationContactSellerRequest.type ?? "magazine_notifications",
        notificationEntityId: notificationContactSellerRequest.notificationEntityId ?? "notificationEntityId",
        previousNotificationId: notificationContactSellerRequest.previousNotificationId ?? null,

        frontData: {
            contactSeller: {
                post: notificationContactSellerRequest.frontData.contactSeller?.post ?? new Types.ObjectId(),
                client: {
                    clientId: notificationContactSellerRequest.frontData.contactSeller?.client?.clientId ?? "clientId",
                    name: notificationContactSellerRequest.frontData.contactSeller?.client?.name ?? "name",
                    email: notificationContactSellerRequest.frontData.contactSeller?.client?.email ?? "email",
                    lastName: notificationContactSellerRequest.frontData.contactSeller?.client?.lastName ?? "lastName",
                    username: notificationContactSellerRequest.frontData.contactSeller?.client?.username ?? "username",
                    phone: notificationContactSellerRequest.frontData.contactSeller?.client?.phone ?? "phone",
                    message: notificationContactSellerRequest.frontData.contactSeller?.client?.message ?? "message",
                }
            }
        }
    }

    return notificationContactSeller
}