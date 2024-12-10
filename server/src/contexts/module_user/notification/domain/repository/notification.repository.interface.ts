import { Model, Schema, Types } from "mongoose";
import { NotificationGroup } from "../entity/notification.group.entity";
import { NotificationMagazine } from "../entity/notification.magazine.entity";
import { GROUP_notification_graph_model_get_all } from "../../application/dtos/getAll.notification.dto";
import { NotificationUser } from "../entity/notification.user.entity";


export interface NotificationRepositoryInterface {
    changeNotificationStatus(userRequestId: string, notificationId: string[], view: boolean): Promise<void>
    saveGroupNotification(notification: NotificationGroup, session?: any): Promise<Types.ObjectId>;
    saveMagazineNotification(notification: NotificationMagazine, session?: any): Promise<Types.ObjectId>;
    saveUserNotification(notification: NotificationUser, session?: any): Promise<Types.ObjectId>;
    setNotificationActionsToFalseById(id: string, session?: any): Promise<void>

    getAllNotificationsFromUserById(
        id: string,
        limit: number,
        page: number,
    ): Promise<GROUP_notification_graph_model_get_all>;
}