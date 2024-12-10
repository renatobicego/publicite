import { Schema } from 'mongoose';
import NotificationModel, { NotificationDocument } from "./notification.schema";
import { UserRelationType } from '../../domain/entity/notification.user.entity';

interface INotificationUser extends NotificationDocument {
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


const NotificationUserSchema = new Schema<INotificationUser>({
    frontData: {
        userRelation: {
            userFrom: {
                username: { type: String, required: true },
                profilePhotoUrl: { type: String, required: true },
                profileUrl: { type: String, required: true },
            },
            typeRelation: { type: String, enum: Object.values(UserRelationType) },
        }
    }
})

const NotificationUserModel = NotificationModel.discriminator('NotificationUser', NotificationUserSchema);

export { NotificationUserModel, INotificationUser };