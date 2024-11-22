import { Schema } from 'mongoose';
import NotificationModel, { NotificationDocument } from "./notification.schema";

interface INotificationMagazine extends NotificationDocument {
    frontData: {
        magazine: {
            _id: string;
            name: string;
            ownerType: string;
            groupInviting?: {
                name: string;
            };
            userInviting?: {
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
                name: { type: String }
            },
            userInviting: {
                username: { type: String }
            }
        }
    }
})

const NotificationMagazineModel = NotificationModel.discriminator('NotificationMagazine', NotificationMagazineSchema);

export { NotificationMagazineModel, INotificationMagazine };