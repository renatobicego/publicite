import { MyLoggerService } from "src/contexts/module_shared/logger/logger.service";
import { eventsThatMakeActionsInactive, typeOfNotification } from "../domain/allowed-events/allowed.events.notifications";
import { Notification } from "../domain/entity/notification.entity";
import { NotificationFactoryInterface } from "../domain/notification-factory/notification.factory.interface";
import { NotificationGroup } from "../domain/entity/notification.group.entity";
import { NotificationMagazine } from "../domain/entity/notification.magazine.entity";

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
        const { event, viewed, date, backData } = this.verifyNotificationAndExtractAtributes(notificationData);

        const { frontData } = notificationData

        if (eventsThatMakeActionsInactive.includes(event)) isActionsAvailable = false;

        const baseNotification = new Notification(event, viewed, date, backData.userIdTo, isActionsAvailable, backData);


        switch (notificationType) {
            case typeOfNotification.group_notification:
                return new NotificationGroup(baseNotification, frontData);

            case typeOfNotification.magazine_notification:

                return new NotificationMagazine(baseNotification, frontData);

            default:
                throw new Error("Tipo de notificación no reconocido");
        }
    }

    private verifyNotificationAndExtractAtributes(notificationBody: any): {
        event: string,
        viewed: boolean,
        date: string,
        backData: { userIdTo: string, userIdFrom: string }
    } {
        if (!notificationBody.notification || !notificationBody.notification.event || !notificationBody.notification.date || !notificationBody.notification.backData) {
            this.logger.error('Notification not found, check your notification socket');
            throw new Error('Notification not found, check your notification socket');
        }

        return {
            event: notificationBody.notification.event,
            viewed: notificationBody.notification.viewed,
            date: notificationBody.notification.date,
            backData: notificationBody.notification.backData
        };
    }
}
