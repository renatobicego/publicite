import { Schema } from 'mongoose';


import NotificationModel, { NotificationDocument } from "./notification.schema";

interface INotificationSubscription extends NotificationDocument {
    frontData: {
        subscription: {
            event: string,
        }
    }
}


const NotificationSubscriptionSchema = new Schema<INotificationSubscription>({
    frontData: {
        subscription: {
            event: { type: String, required: true },
        }
    }
})

const NotificationSubscriptionModel = NotificationModel.discriminator('NotificationSubscription', NotificationSubscriptionSchema);

export { NotificationSubscriptionModel, INotificationSubscription };