import { notification_graph_model_get_all } from "../../application/dtos/getAll.notification.dto";
import { PaymentDataFromMeli } from "../../application/dtos/payment.data.meli";

export interface NotificationAdapterInterface {
    changeNotificationStatus(userRequestId: string, notificationId: string[], view: boolean): Promise<void>
    deleteNotificationById(event: string, userRequestId: string, _id: string): Promise<void>
    getAllNotificationsFromUserById(
        id: string,
        limit: number,
        page: number,
    ): Promise<notification_graph_model_get_all>;
    pushPaymentSubscriptionNotification(paymentDataFromMeli: PaymentDataFromMeli): Promise<void>;


    downgrade_plan_contact(userId: string): Promise<void>
    downgrade_plan_post(userId: string): Promise<void>





}