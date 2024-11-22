import { Schema } from 'mongoose';
import NotificationModel, { NotificationDocument } from "./notification.schema";

interface INotificationGroup extends NotificationDocument {
    frontData: {
        group: {
            _id: string;
            name: string;
            profilePhotoUrl: string;
            userInviting: {
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
            profilePhotoUrl: { type: String, required: true },
            userInviting: {
                username: { type: String, required: true },
            },
        }
    }
})

const NotificationGroupModel = NotificationModel.discriminator('NotificationGroup', NotificationGroupSchema);

export { NotificationGroupModel, INotificationGroup };