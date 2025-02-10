import { Types } from "mongoose";



import { MyLoggerService } from "src/contexts/module_shared/logger/logger.service";
import { typeOfNotification } from "../domain/allowed-events/allowed.events.notifications";
import { Notification } from "../domain/entity/notification.entity";
import { NotificationFactoryInterface } from "../domain/notification-factory/notification.factory.interface";
import { NotificationGroup } from "../domain/entity/notification.group.entity";
import { NotificationMagazine } from "../domain/entity/notification.magazine.entity";
import { NotificationUser } from "../domain/entity/notification.user.entity";
import { NotificationPost } from "../domain/entity/notification.post.entity";
import { validatePostNotification } from "../domain/notification-factory/validatePostNotification";
import { NotificationContactSeller } from "../domain/entity/notification.contactSeller.entity";
import { NotificationPayment } from "../domain/entity/notification.payment";
import { NotificationPostCalification } from "../domain/entity/notification.postCalification.entity";
import { NotificationShare } from "../domain/entity/notification.share";
import { NotificationSubscription } from "../domain/entity/notification.subscription.entity";


export class NotificationFactory implements NotificationFactoryInterface {

    private static instance: NotificationFactory | null = null;
    private readonly logger: MyLoggerService;


    private constructor(logger: MyLoggerService) {
        this.logger = logger;
    }


    public static getInstance(logger: MyLoggerService): NotificationFactory {
        if (!NotificationFactory.instance) {
            NotificationFactory.instance = new NotificationFactory(logger);
        }
        return NotificationFactory.instance;
    }



    createNotification(notificationType: typeOfNotification, notificationData: any): Notification {
        try {
            let isActionsAvailable = true;
            const { event, viewed, backData, socketJobId, type, previousNotificationId, notificationEntityId } = this.verifyNotificationAtributes(notificationData);
            const { frontData } = notificationData
            const user = backData.userIdTo
            const date = Date.now()

            this.logger.log("Creating notification: " + notificationType);
            const notificationClassMap = {
                [typeOfNotification.group_notifications]: NotificationGroup,
                [typeOfNotification.magazine_notifications]: NotificationMagazine,
                [typeOfNotification.user_notifications]: NotificationUser,
                [typeOfNotification.post_notifications]: NotificationPost,
                [typeOfNotification.contact_seller_notifications]: NotificationContactSeller,
                [typeOfNotification.payment_notifications]: NotificationPayment,
                [typeOfNotification.post_calification_notifications]: NotificationPostCalification,
                [typeOfNotification.share_notifications]: NotificationShare,
                [typeOfNotification.subscription_notifications]: NotificationSubscription
            };

            const NotificationClass = notificationClassMap[notificationType];

            if (!NotificationClass) {
                throw new Error("Tipo de notificación no reconocido");
            }

            if (notificationType === typeOfNotification.post_notifications) {
                this.logger.log("Validating post notification.....");
                validatePostNotification(notificationData);
            }
            if (notificationType === typeOfNotification.contact_seller_notifications) {
                frontData.contactSeller.post = new Types.ObjectId(frontData.contactSeller.post);
            }
            const baseNotification = new Notification(event, viewed, date, user, isActionsAvailable, backData, socketJobId, type, notificationEntityId, previousNotificationId);
            return new NotificationClass(baseNotification, frontData);
        } catch (error: any) {
            this.logger.error("Error creating notification: " + error.message);
            this.logger.error("Notification Type: " + notificationType);
            throw error;
        }
    }

    private verifyNotificationAtributes(notificationBody: any): {
        event: string,
        viewed: boolean,
        backData: { userIdTo: string, userIdFrom: string },
        socketJobId: string,
        type: string,
        notificationEntityId: string,
        previousNotificationId: string
    } {

        const { event, viewed, backData, socketJobId, type, previousNotificationId, notificationEntityId } = notificationBody;


        if (
            !event ||
            viewed === undefined ||
            !backData ||
            !backData.userIdTo ||
            !backData.userIdFrom ||
            !socketJobId ||
            !type ||
            !notificationEntityId

        ) {
            throw new Error("Notificacion no válida");
        }

        return {
            event: event,
            viewed: viewed,
            backData: backData,
            socketJobId: socketJobId,
            type: type,
            notificationEntityId: notificationEntityId,
            previousNotificationId: previousNotificationId ?? null,
        };
    }

}
