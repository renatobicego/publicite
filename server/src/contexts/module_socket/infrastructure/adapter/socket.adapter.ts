import { Inject } from "@nestjs/common";
import { SocketAdapterInterface } from "../../application/adapter/socket.adapter.interface";

import { NotificationHandlerServiceInterface } from "src/contexts/module_user/notification/domain/service/notification.handler.service.interface";

export class SocketAdapter implements SocketAdapterInterface {

    constructor(
        @Inject('NotificationHandlerServiceInterface')
        private readonly notificationHandler: NotificationHandlerServiceInterface,
    ) { }
    async sendPostCalificationNotificationToNotificationService(notificationBody: any): Promise<void> {
        try {
            return await this.notificationHandler.handlePostCalificationNotification(notificationBody);
        } catch (error: any) {
            throw error;
        }
    }





    async sendUserNotificationToNotificationService(notificationBody: any): Promise<void> {
        try {
            return await this.notificationHandler.handleUserNotification(notificationBody);
        } catch (error: any) {
            throw error;
        }
    }

    async sendMagazineNotificationToNotificationService(notificationBody: any): Promise<void> {
        try {
            return await this.notificationHandler.handleMagazineNotification(notificationBody);
        } catch (error: any) {
            throw error;
        }
    }
    async sendGroupNotificationToNotificationService(notificationBody: any): Promise<void> {
        try {
            await this.notificationHandler.handleGroupNotification(notificationBody);
        } catch (error: any) {
            throw error;
        }
    }

    async sendPostNotificationToNotificationService(notificationBody: any): Promise<void> {
        try {
            return await this.notificationHandler.handlePostNotification(notificationBody);
        } catch (error: any) {
            throw error;
        }
    }





    async sendContactSellerNotificationToNotificationService(notificationBody: any): Promise<void> {
        try {
            return await this.notificationHandler.handleContactSellerNotification(notificationBody);
        } catch (error: any) {
            throw error;
        }
    }



}