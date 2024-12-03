
export class Notification {

    private event: string;
    private viewed: boolean;
    private date: string;
    private user: string;
    private isActionsAvailable: boolean;
    private backData: {
        userIdTo: string
        userIdFrom: string
    }
    private socketJobId: string
    private type: string
    private previusNotificationId: string




    constructor(event: string, viewed: boolean, date: string, user: string, isActionsAvailable: boolean,
        backData: { userIdTo: string, userIdFrom: string },
        socketJobId: string,
        type: string,
        previusNotificationId: string) {
        this.event = event;
        this.viewed = viewed;
        this.date = date;
        this.user = user;
        this.isActionsAvailable = isActionsAvailable;
        this.backData = backData
        this.socketJobId = socketJobId
        this.type = type
        this.previusNotificationId = previusNotificationId ?? null
    }


    get getPreviusNotificationId(): string | null {
        return this.previusNotificationId
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

    get getDate(): string {
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


}