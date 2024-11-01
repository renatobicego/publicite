export interface SocketAdapterInterface {
    handleEventNotification(notificationBody: any): Promise<void>;
}