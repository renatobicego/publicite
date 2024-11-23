import { Schema } from 'mongoose';
import NotificationModel, { NotificationDocument } from "./notification.schema";

interface INotificationMagazine extends NotificationDocument {
    frontData: {
        magazine: {
            _id: string;
            name: string;
            ownerType: string;
            groupInviting?: {
                _id: string;
                name: string;
            };
            userInviting?: {
                _id: string;
                username: string;
            };
        }
    }
}


const NotificationMagazineSchema = new Schema<INotificationMagazine>({
    frontData: {
        magazine: {
            _id: { type: String, required: true },
            name: { type: String, required: true },
            ownerType: { type: String, required: true },
            groupInviting: {
                _id: { type: String },
                name: { type: String }
            },
            userInviting: {
                _id: { type: String },
                username: { type: String }
            }
        }
    }
})

const NotificationMagazineModel = NotificationModel.discriminator('NotificationMagazine', NotificationMagazineSchema);

export { NotificationMagazineModel, INotificationMagazine };