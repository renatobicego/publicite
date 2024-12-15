import { notification_graph_model_get_all} from "../../application/dtos/getAll.notification.dto";

export interface NotificationAdapterInterface {
    changeNotificationStatus(userRequestId: string, notificationId: string[], view: boolean): Promise<void>
    getAllNotificationsFromUserById(
        id: string,
        limit: number,
        page: number,
    ): Promise<notification_graph_model_get_all>;


}