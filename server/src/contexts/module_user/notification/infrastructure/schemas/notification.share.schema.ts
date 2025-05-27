import { Schema } from 'mongoose';


import NotificationModel, { NotificationDocument } from "./notification.schema";
import { ShareTypesEnum } from '../../domain/entity/enum/notification.share.enum';

interface INotificationShare extends NotificationDocument {
    frontData: {
        share: {
            type: ShareTypesEnum,
            _id: string,
            description: string
            username: string,
            imageUrl?: string
        }
    }
}


const NotificationShareSchema = new Schema<INotificationShare>({
    frontData: {
        share: {
            type: { type: String, enum: Object.values(ShareTypesEnum), required: true },
            _id: { type: String, required: true },
            description: { type: String, required: true },
            username: { type: String, required: true },
            imageUrl: { type: String }
        }
    }
})

const NotificationShareModel = NotificationModel.discriminator('NotificationShare', NotificationShareSchema);

export { NotificationShareModel, INotificationShare };