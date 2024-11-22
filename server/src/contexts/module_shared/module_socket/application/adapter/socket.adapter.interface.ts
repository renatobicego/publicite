export interface SocketAdapterInterface {
    sendGroupNotificationToNotificationService(notificationBody: any): Promise<void>;
    sendMagazineNotificationToNotificationService(notificationBody: any): Promise<void>;
}