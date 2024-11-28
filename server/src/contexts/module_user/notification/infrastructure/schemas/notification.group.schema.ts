import { Schema } from 'mongoose';
import NotificationModel, { NotificationDocument } from "./notification.schema";

interface INotificationGroup extends NotificationDocument {
    frontData: {
        group: {
            _id: string;
            name: string;
            profilePhotoUrl: string;
            userInviting: {
                _id: string;
                username: string;
            };
        }
    }
}


const NotificationGroupSchema = new Schema<INotificationGroup>({
    frontData: {
        group: {
            _id: { type: String, required: true },
            name: { type: String, required: true },
            profilePhotoUrl: { type: String },
            userInviting: {
                _id: { type: String },
                username: { type: String }
            }
        }
    }
})

const NotificationGroupModel = NotificationModel.discriminator('NotificationGroup', NotificationGroupSchema);

export { NotificationGroupModel, INotificationGroup };