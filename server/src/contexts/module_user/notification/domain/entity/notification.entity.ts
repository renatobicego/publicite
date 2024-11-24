
export class Notification {
    private notification: {
        event: string;
        viewed: boolean;
        date: string;
        user: string;
        isActionsAvailable: boolean;
        backData: {
            userIdTo: string
            userIdFrom: string
        }
    }



    constructor(event: string, viewed: boolean, date: string, user: string, isActionsAvailable: boolean, backData: { userIdTo: string, userIdFrom: string }) {
        this.notification = {
            event: event,
            viewed: viewed,
            date: date,
            user: user,
            isActionsAvailable: isActionsAvailable,
            backData: backData,
        };
    }

    get getViewed(): boolean {
        return this.notification.viewed;
    }

    get getDate(): string {
        return this.notification.date;
    }

    get getIsActionsAvailable() {
        return this.notification.isActionsAvailable;
    }


    get getEvent(): string {
        return this.notification.event;
    }

    get getUser(): string {
        return this.notification.user
    }
    get getbackData(): { userIdTo: string, userIdFrom: string } {
        return this.notification.backData
    }


}