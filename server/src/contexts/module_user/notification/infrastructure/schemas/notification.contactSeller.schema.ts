import { Schema } from 'mongoose';
import NotificationModel, { NotificationDocument } from "./notification.schema";

interface INotificationContactSeller extends NotificationDocument {
    frontData: {
        contactSeller: {
            post: {
                _id: string,
                title: string,
                imagesUrls: string,
                price: number
            }
            client: {
                _id: string,
                name: string,
                email: string,
                lastName: string,
                username: string,
                phone: string,
                message: string
            }
        }
    }
}


const NotificationContactSellerSchema = new Schema<INotificationContactSeller>({
    frontData: {
        contactSeller: {
            post: {
                _id: { type: String, required: true },
                title: { type: String, required: true },
                imagesUrls: { type: String, required: true },
                price: { type: Number, required: true },
            },
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
})

const NotificationContactSellerModel = NotificationModel.discriminator('NotificationContactSeller', NotificationContactSellerSchema);

export { NotificationContactSellerModel, INotificationContactSeller };