import { Inject } from "@nestjs/common";
import { SocketAdapterInterface } from "../../application/adapter/socket.adapter.interface";
import { NotificationGroupServiceInterface } from "src/contexts/module_user/notification/domain/service/notification.group.service.interface";
import { NotificationMagazineServiceInterface } from "src/contexts/module_user/notification/domain/service/notification.magazine.service.interface";
import { NotificationUserServiceInterface } from "src/contexts/module_user/notification/domain/service/notification.user.service.interface";

export class SocketAdapter implements SocketAdapterInterface {

    constructor(
        @Inject('NotificationGroupServiceInterface')
        private readonly notificationGroupService: NotificationGroupServiceInterface,
        @Inject('NotificationMagazineServiceInterface')
        private readonly notificationMagazineService: NotificationMagazineServiceInterface,
        @Inject('NotificationUserServiceInterface')
        private readonly notificationUserServiceInterface: NotificationUserServiceInterface


    ) { }



    async sendUserNotificationToNotificationService(notificationBody: any): Promise<void> {
        try {
            return await this.notificationUserServiceInterface.handleUserNotificationAndCreateIt(notificationBody);
        } catch (error: any) {
            throw error;
        }
    }

    async sendMagazineNotificationToNotificationService(notificationBody: any): Promise<void> {
        try {
            return await this.notificationMagazineService.handleMagazineNotificationAndCreateIt(notificationBody);
        } catch (error: any) {
            throw error;
        }
    }
    async sendGroupNotificationToNotificationService(notificationBody: any): Promise<void> {
        try {
            await this.notificationGroupService.handleGroupNotificationAndCreateIt(notificationBody);
        } catch (error: any) {
            throw error;
        }
    }

}