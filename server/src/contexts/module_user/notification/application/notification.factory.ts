import { MyLoggerService } from "src/contexts/module_shared/logger/logger.service";
import { typeOfNotification } from "../domain/allowed-events/allowed.events.notifications";
import { Notification } from "../domain/entity/notification.entity";
import { NotificationFactoryInterface } from "../domain/notification-factory/notification.factory.interface";
import { NotificationGroup } from "../domain/entity/notification.group.entity";
import { NotificationMagazine } from "../domain/entity/notification.magazine.entity";
import { NotificationUser } from "../domain/entity/notification.user.entity";
import { NotificationPost } from "../domain/entity/notification.post.entity";
import { NotificationPostType } from "../domain/entity/enum/notification.post.type.enum";
import { validatePostNotification } from "../domain/notification-factory/validatePostNotification";
import { NotificationContactSeller } from "../domain/entity/notification.contactSeller.entity";

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
            };

            const NotificationClass = notificationClassMap[notificationType];

            if (!NotificationClass) {
                throw new Error("Tipo de notificación no reconocido");
            }

            if (notificationType === typeOfNotification.post_notifications) {
                this.logger.log("Validating post notification.....");
                validatePostNotification(notificationData);
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
        date: string,
        backData: { userIdTo: string, userIdFrom: string },
        socketJobId: string,
        type: string,
        notificationEntityId: string,
        previousNotificationId: string
    } {

        const { event, viewed, date, backData, socketJobId, type, previousNotificationId, notificationEntityId } = notificationBody;


        if (
            !event ||
            viewed === undefined ||
            !date ||
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
            date: date,
            backData: backData,
            socketJobId: socketJobId,
            type: type,
            notificationEntityId: notificationEntityId,
            previousNotificationId: previousNotificationId ?? null,
        };
    }

}
