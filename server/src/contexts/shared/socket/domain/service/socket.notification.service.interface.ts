export interface SocketNotificationServiceInterface {
  sendNotificationToUser(data: any): Promise<void>;
}
