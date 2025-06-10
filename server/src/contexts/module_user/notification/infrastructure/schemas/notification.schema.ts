import { model, Schema } from "mongoose";




export interface NotificationDocument extends Document {
    event: string;
    viewed: boolean;
    date: Date;
    user: string;
    isActionsAvailable: boolean;
    backData: {
        userIdTo: string;
        userIdFrom: string;
    }
    socketJobId: string;
    type: string;
    notificationEntityId: string;
    previousNotificationId: string;

}

export const NotificationSchema = new Schema<NotificationDocument>({

    event: { type: String, required: true },
    viewed: { type: Boolean, required: true, default: false },
    date: { type: Date, required: true, default: Date.now() },
    user: { type: String, required: true },
    isActionsAvailable: { type: Boolean, required: true },
    backData: {
        userIdTo: { type: String, required: true },
        userIdFrom: { type: String },
    },
    socketJobId: {
        type: String, required: true
    },
    type: {
        type: String, required: true
    },
    notificationEntityId: {
        type: String, required: true
    },
    previousNotificationId: {
        type: String, default: null
    }

}, {
    discriminatorKey: 'kind',
    collection: 'Notifications',
    selectPopulatedPaths: false,
},)


const NotificationModel = model<NotificationDocument>('notification', NotificationSchema);
NotificationSchema.index({ viewed: 1 });
NotificationSchema.index({ notificationEntityId: 1 });

export default NotificationModel;