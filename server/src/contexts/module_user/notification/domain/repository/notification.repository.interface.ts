import { Types } from "mongoose";
import { NotificationGroup } from "../entity/notification.group.entity";
import { NotificationMagazine } from "../entity/notification.magazine.entity";
import { GROUP_notification_graph_model_get_all } from "../../application/dtos/getAll.notification.dto";


export interface NotificationRepositoryInterface {
    changeNotificationStatus(userRequestId: string, notificationId: string[], view: boolean): Promise<void>
    saveGroupNotification(notification: NotificationGroup, session?: any): Promise<Types.ObjectId>;
    saveMagazineNotification(notification: NotificationMagazine, session?: any): Promise<Types.ObjectId>;
    getAllNotificationsFromUserById(
        id: string,
        limit: number,
        page: number,
    ): Promise<GROUP_notification_graph_model_get_all>;
}