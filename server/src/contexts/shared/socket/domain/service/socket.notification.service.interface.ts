

export interface SocketNotificationServiceInterface {
  handleEventNotification(notificationBody: any): Promise<any>;
}
