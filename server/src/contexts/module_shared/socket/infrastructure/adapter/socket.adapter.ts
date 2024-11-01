import { Inject } from "@nestjs/common";
import { SocketAdapterInterface } from "../../application/adapter/socket.adapter.interface";
import { SocketNotificationServiceInterface } from "../../domain/service/socket.notification.service.interface";

export class SocketAdapter implements SocketAdapterInterface {
    constructor(
        @Inject('SocketNotificationServiceInterface')
        private readonly notificatorService: SocketNotificationServiceInterface
    ) { }
    handleEventNotification(notificationBody: any): Promise<void> {
        try {
            return this.notificatorService.handleEventNotification(notificationBody);
        } catch (error: any) {
            throw error;
        }
    }

}