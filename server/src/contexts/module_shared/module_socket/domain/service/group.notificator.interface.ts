export interface GroupNotificatorInterface {
    sendNotificationToGroup(
        notification: any,
        event: string,
        session?: any,
    ): Promise<any>;

}