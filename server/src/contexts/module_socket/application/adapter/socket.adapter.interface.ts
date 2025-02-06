export interface SocketAdapterInterface {
    sendGroupNotificationToNotificationService(notificationBody: any): Promise<void>;
    sendMagazineNotificationToNotificationService(notificationBody: any): Promise<void>;
    sendUserNotificationToNotificationService(notificationBody: any): Promise<void>;
    sendPostNotificationToNotificationService(notificationBody: any): Promise<void>
    //sendSubscriptionNotificationToNotificationService(notificationBody:any): Promise<void>
    sendContactSellerNotificationToNotificationService(notificationBody: any): Promise<void>
    sendPostCalificationNotificationToNotificationService(notificationBody: any): Promise<void>
    sendShareNotificationToNotificationService(notificationBody: any): Promise<void>
}