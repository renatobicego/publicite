import { Schema } from 'mongoose';


import NotificationModel, { NotificationDocument } from "./notification.schema";
import { ShareTypesEnum } from '../../domain/entity/enum/notification.share.enum';

interface INotificationShare extends NotificationDocument {
    frontData: {
        share: {
            type: ShareTypesEnum,
            _id: string,
            description: string
        }
    }
}


const NotificationShareSchema = new Schema<INotificationShare>({
    frontData: {
        share: {
            type: { type: String, enum: Object.values(ShareTypesEnum), required: true },
            _id: { type: String, required: true },
            description: { type: String, required: true },
        }
    }
})

const NotificationShareModel = NotificationModel.discriminator('NotificationShare', NotificationShareSchema);

export { NotificationShareModel, INotificationShare };