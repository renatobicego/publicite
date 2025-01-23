export interface NotificationSubscriptionServiceInterface {
    createNotificationAndSendToUser(notification:any):Promise<void>;
}