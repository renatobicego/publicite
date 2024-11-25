import { model, Schema } from "mongoose";




export interface NotificationDocument extends Document {
    event: string;
    viewed: boolean;
    date: string;
    user: string;
    isActionsAvailable: boolean;
    backData: {
        userIdTo: string;
        userIdFrom: string;
    }
    socketJobId: string

}

export const NotificationSchema = new Schema<NotificationDocument>({

    event: { type: String, required: true },
    viewed: { type: Boolean, required: true, default: false },
    date: { type: String, required: true },
    user: { type: String, required: true },
    isActionsAvailable: { type: Boolean, required: true },
    backData: {
        userIdTo: { type: String, required: true },
        userIdFrom: { type: String, required: true },
    },
    socketJobId: {
        type: String, required: true
    }


}, {
    discriminatorKey: 'kind',
    collection: 'Notifications',
    selectPopulatedPaths: false,
},)


const NotificationModel = model<NotificationDocument>('notification', NotificationSchema);

export default NotificationModel;