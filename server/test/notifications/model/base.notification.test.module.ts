import { Types } from "mongoose";

export class Notification_testing_model {
    _id?: Types.ObjectId;
    event: string;
    viewed?: boolean;
    date?: any;
    user?: string;
    isActionsAvailable?: boolean;
    backData: {
        userIdTo: string
        userIdFrom: string
    }
    socketJobId?: string
    type: string
    notificationEntityId?: string
    previousNotificationId?: string | null;
}
