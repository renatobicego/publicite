export interface SocketAdapterInterface {
    sendGroupNotificationToNotificationService(notificationBody: any): Promise<void>;
    sendMagazineNotificationToNotificationService(notificationBody: any): Promise<void>;
    sendUserNotificationToNotificationService(notificationBody: any): Promise<void>;
    sendPostNotificationToNotificationService(notificationBody: any): Promise<void>
}