import { Inject } from "@nestjs/common";
import { SocketAdapterInterface } from "../../application/adapter/socket.adapter.interface";
import { SocketNotificationServiceInterface } from "../../domain/service/socket.notification.service.interface";

export class SocketAdapter implements SocketAdapterInterface {
    constructor(
        @Inject('SocketNotificationServiceInterface')
        private readonly notificatorService: SocketNotificationServiceInterface
    ) { }
    async handleMagazineNotification(notificationBody: any): Promise<void> {
        try {
            return await this.notificatorService.handleMagazineNotification(notificationBody);
        } catch (error: any) {
            throw error;
        }
    }
    async handleGroupNotification(notificationBody: any): Promise<void> {
        try {
            return await this.notificatorService.sendNotificationToUserAndGroup(notificationBody);
        } catch (error: any) {
            throw error;
        }
    }

}