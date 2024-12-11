import { MyLoggerService } from "src/contexts/module_shared/logger/logger.service";
import { typeOfNotification } from "../domain/allowed-events/allowed.events.notifications";
import { Notification } from "../domain/entity/notification.entity";
import { NotificationFactoryInterface } from "../domain/notification-factory/notification.factory.interface";
import { NotificationGroup } from "../domain/entity/notification.group.entity";
import { NotificationMagazine } from "../domain/entity/notification.magazine.entity";
import { NotificationUser } from "../domain/entity/notification.user.entity";

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
        let isActionsAvailable = true;
        const { event, viewed, date, backData, socketJobId, type, previousNotificationId, notificationEntityId } = this.verifyNotificationAtributes(notificationData);
        const { frontData } = notificationData
        const user = backData.userIdTo



        const baseNotification = new Notification(event, viewed, date, user, isActionsAvailable, backData, socketJobId, type, notificationEntityId, previousNotificationId);
        switch (notificationType) {
            case typeOfNotification.group_notification:
                return new NotificationGroup(baseNotification, frontData);
            case typeOfNotification.magazine_notification:
                return new NotificationMagazine(baseNotification, frontData);
            case typeOfNotification.user_notification:
                return new NotificationUser(baseNotification, frontData);
            default:
                throw new Error("Tipo de notificación no reconocido");
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
