import { Schema } from 'mongoose';
import NotificationModel, { NotificationDocument } from "./notification.schema";

interface INotificationPayment extends NotificationDocument {
    frontData: {
        subscriptionPlan: {
            _id: string,
            reason: string,
            status: string,
            retryAttemp: string,
        }
    }
}


const NotificationPaymentSchema = new Schema<INotificationPayment>({
    frontData: {
        subscriptionPlan: {
            _id: { type: String, required: true },
            reason: { type: String, required: true },
            status: { type: String, required: true },
            retryAttemp: { type: String, required: true },
        }
    }
})

const NotificationPaymentModel = NotificationModel.discriminator('NotificationPaymentModel', NotificationPaymentSchema);

export { NotificationPaymentModel, INotificationPayment };