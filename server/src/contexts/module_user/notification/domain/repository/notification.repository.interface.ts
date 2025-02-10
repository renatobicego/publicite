import { Types } from "mongoose";


import { NotificationGroup } from "../entity/notification.group.entity";
import { NotificationMagazine } from "../entity/notification.magazine.entity";
import { notification_graph_model_get_all } from "../../application/dtos/getAll.notification.dto";
import { NotificationUser } from "../entity/notification.user.entity";
import { NotificationPost } from "../entity/notification.post.entity";
import { NotificationContactSeller } from "../entity/notification.contactSeller.entity";
import { NotificationPayment } from "../entity/notification.payment";
import { NotificationPostCalification } from "../entity/notification.postCalification.entity";
import { NotificationShare } from "../entity/notification.share";
import { NotificationSubscription } from "../entity/notification.subscription.entity";


export interface NotificationRepositoryInterface {
    changeNotificationStatus(userRequestId: string, notificationId: string[], view: boolean): Promise<void>
    deleteNotificationById(event: string, userRequestId: string, _id: string): Promise<void>

    saveGroupNotification(notification: NotificationGroup, session?: any): Promise<Types.ObjectId>;
    saveMagazineNotification(notification: NotificationMagazine, session?: any): Promise<Types.ObjectId>;
    saveUserNotification(notification: NotificationUser, session?: any): Promise<Types.ObjectId>;
    savePostNotification(notification: NotificationPost, session?: any): Promise<Types.ObjectId>;
    saveNotificationContactSeller(notification: NotificationContactSeller, session?: any): Promise<Types.ObjectId>
    saveRequestCalificationNotification(notification: NotificationPostCalification, session?: any): Promise<Types.ObjectId>
    saveShareNotification(notification: NotificationShare, session?: any): Promise<Types.ObjectId>
    savePaymentNotification(notification: NotificationPayment, session?: any): Promise<any>
    saveSubscriptionNotification(notification: NotificationSubscription, session?: any): Promise<Types.ObjectId>
    setNotificationActionsToFalseById(id: string, session?: any): Promise<void>

    isThisNotificationDuplicate(notificationEntityId: string): Promise<boolean>;
    getAllNotificationsFromUserById(
        id: string,
        limit: number,
        page: number,
    ): Promise<notification_graph_model_get_all>;
}