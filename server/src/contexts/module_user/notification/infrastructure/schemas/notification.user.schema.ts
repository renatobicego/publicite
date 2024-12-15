import { Schema, Types } from 'mongoose';
import NotificationModel, { NotificationDocument } from "./notification.schema";
import { UserRelationType } from '../../domain/entity/notification.user.entity';

interface INotificationUser extends NotificationDocument {
    frontData: {
        userRelation: {
            _id: { type: Types.ObjectId },
            userFrom: {
                _id: string;
                username: string;
                profilePhotoUrl: string;
            };
            typeRelation: UserRelationType | null;
        }
    }
}


const NotificationUserSchema = new Schema<INotificationUser>({
    frontData: {
        userRelation: {
            _id: { type: Types.ObjectId },
            userFrom: {
                _id: { type: String, required: true },
                username: { type: String, required: true },
                profilePhotoUrl: { type: String, required: true },
            },
            typeRelation: { type: String, enum: Object.values(UserRelationType) },
        }
    }
})

const NotificationUserModel = NotificationModel.discriminator('NotificationUser', NotificationUserSchema);

export { NotificationUserModel, INotificationUser };