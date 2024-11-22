
export class Notification {
    private event: string
    private viewed: boolean
    private date: string
    private user: string;
    private isActionsAvailable: boolean;
    private backdata: {
        userIdTo: string
        userIdFrom: string
    }


    constructor(event: string, viewed: boolean, date: string, user: string, isActionsAvailable: boolean, backdata: { userIdTo: string, userIdFrom: string }) {
        this.event = event;
        this.viewed = viewed;
        this.date = date;
        this.user = user;
        this.isActionsAvailable = isActionsAvailable;
        this.backdata = backdata;
    }

    get getViewed() {
        return this.viewed;
    }

    get getDate() {
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
    get getBackData(): { userIdTo: string, userIdFrom: string } {
        return this.backdata
    }


}