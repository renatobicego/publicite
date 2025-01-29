import { Schema, Types } from 'mongoose';
import NotificationModel, { NotificationDocument } from "./notification.schema";

interface INotificationContactSeller extends NotificationDocument {
    frontData: {
        contactSeller: {
            post: Types.ObjectId;
            client: {
                _id: string;
                name: string;
                email: string;
                lastName: string;
                username: string;
                phone: string;
                message: string;
            };
        };
    };
}

const NotificationContactSellerSchema = new Schema<INotificationContactSeller>({
    frontData: {
        contactSeller: {
            post: { type: Schema.Types.ObjectId, ref: 'Post' },
            client: {
                _id: { type: String, default: null },
                name: { type: String, required: true },
                email: { type: String, required: true },
                lastName: { type: String, required: true },
                username: { type: String, default: null },
                phone: { type: String, default: null },
                message: { type: String, required: true },
            }
        }
    }
});

const NotificationContactSellerModel = NotificationModel.discriminator('NotificationContactSeller', NotificationContactSellerSchema);

export { NotificationContactSellerModel, INotificationContactSeller };
