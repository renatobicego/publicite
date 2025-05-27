
export class Notification {

    private event: string;
    private viewed: boolean;
    private date: any;
    private user: string;
    private isActionsAvailable: boolean;
    private backData: {
        userIdTo: string
        userIdFrom: string
    }
    private socketJobId: string
    private type: string
    private notificationEntityId: string
    private previousNotificationId: string




    constructor(event: string,
        viewed: boolean,
        date: any,
        user: string,
        isActionsAvailable: boolean,
        backData: { userIdTo: string, userIdFrom: string },
        socketJobId: string,
        type: string,
        notificationEntityId: string,
        previousNotificationId: string) {
        this.event = event;
        this.viewed = viewed;
        this.date = date;
        this.user = user;
        this.isActionsAvailable = isActionsAvailable;
        this.backData = backData
        this.socketJobId = socketJobId
        this.type = type
        this.notificationEntityId = notificationEntityId
        this.previousNotificationId = previousNotificationId ?? null
    }


    get getpreviousNotificationId(): string | null {
        return this.previousNotificationId
    }

    get getType(): string {
        return this.type;
    }

    get getSocketJobId(): string {
        return this.socketJobId
    }
    get getViewed(): boolean {
        return this.viewed;
    }

    get getDate(): any {
        return this.date;
    }

    get getIsActionsAvailable() {
        return this.isActionsAvailable;
    }


    get getEvent(): string {
        return this.event;
    }

    get getUser(): string {
        return this.user
    }
    get getbackData(): { userIdTo: string, userIdFrom: string } {
        return this.backData
    }

    get getNotificationEntityId(): string {
        return this.notificationEntityId
    }


}