export interface NotificationHandlerServiceInterface {
  handleGroupNotification(notification: any): Promise<void>;
  handleMagazineNotification(notification: any): Promise<void>;
  handlePostNotification(notification: any): Promise<void>;
  handleUserNotification(notification: any): Promise<void>;
  handleContactSellerNotification(notification: any): Promise<void>;
  handlePostCalificationNotification(notification: any): Promise<void>;
  handleShareNotification(notification: any): Promise<void>;
  handleSubscriptionNotification(userId: string, event: string): Promise<void>;
}
