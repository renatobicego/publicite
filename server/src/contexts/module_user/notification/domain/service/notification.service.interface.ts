import { notification_graph_model_get_all } from "../../application/dtos/getAll.notification.dto";
import { PaymentDataFromMeli } from "../../application/dtos/payment.data.meli";

export interface NotificationServiceInterface {

    changeNotificationStatus(userRequestId: string, notificationId: string[], view: boolean): Promise<void>;
    deleteNotificationById(event: string, userRequestId: string, _id: string): Promise<void>
    getAllNotificationsFromUserById(
        id: string,
        limit: number,
        page: number,
    ): Promise<notification_graph_model_get_all>;
    handlePushSubscriptionNotification(paymentDataFromMeli: PaymentDataFromMeli): Promise<void>;
    handleSubscriptionNotification(userId: string, event: string): Promise<void>


}