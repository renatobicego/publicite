

export interface SocketNotificationServiceInterface {
  sendNotificationToUserAndGroup(notificationBody: any): Promise<any>;
  handleMagazineNotification(notificationBody: any): Promise<void>;
}
