import { Notification } from "./notification.entity";
import { PlanNotificationFrontData } from "./plan.events";


export class NotificationPlan extends Notification {
    private frontData: {
        plan: PlanNotificationFrontData
    };

    constructor(notification: Notification,
        frontData: {
            plan: PlanNotificationFrontData
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
