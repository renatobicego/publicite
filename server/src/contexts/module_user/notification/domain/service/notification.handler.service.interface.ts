export interface NotificationHandlerServiceInterface {
    handleGroupNotification(notification: any): Promise<void>
    handleMagazineNotification(notification: any): Promise<void>
    handlePostNotification(notification: any): Promise<void>
    handleUserNotification(notification: any): Promise<void>
    handleContactSellerNotification(notification: any): Promise<void>
}