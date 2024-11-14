export interface SocketAdapterInterface {
    handleGroupNotification(notificationBody: any): Promise<void>;
    handleMagazineNotification(notificationBody: any): Promise<void>;
}