import { Notification } from "./notification.entity";
import { ProductionTicketNotificationFrontData } from "./production-ticket.events";


export class NotificationProductionTicket extends Notification {
    private frontData: {
        productionTicket: ProductionTicketNotificationFrontData
    };

    constructor(notification: Notification,
        frontData: {
            productionTicket: ProductionTicketNotificationFrontData
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
        )
        this.frontData = frontData
    }

}
