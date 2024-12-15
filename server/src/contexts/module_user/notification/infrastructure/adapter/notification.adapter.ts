import { Inject, Injectable } from "@nestjs/common";
import { NotificationAdapterInterface } from "../../domain/adapter/notification.adapter.interface";
import { NotificationServiceInterface } from "../../domain/service/notification.service.interface";
import { notification_graph_model_get_all} from "../../application/dtos/getAll.notification.dto";

@Injectable()
export class NotificationAdapter implements NotificationAdapterInterface {

    constructor(
        @Inject('NotificationServiceInterface')
        private readonly notificationService: NotificationServiceInterface

    ) { }

    async getAllNotificationsFromUserById(
        id: string,
        limit: number,
        page: number,
    ): Promise<notification_graph_model_get_all> {
        try {
            return await this.notificationService.getAllNotificationsFromUserById(
                id,
                limit,
                page,
            );
        } catch (error: any) {
            throw error;
        }
    }


    async changeNotificationStatus(userRequestId: string, notificationId: string[], view: boolean): Promise<void> {
        try {
            await this.notificationService.changeNotificationStatus(userRequestId, notificationId, view);
        } catch (error: any) {
            throw error;
        }
    }

}