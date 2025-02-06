import { Schema } from 'mongoose';

import NotificationModel, { NotificationDocument } from "./notification.schema";
import { PostType } from '../../domain/entity/enum/post.type.enum';
import { PostCalificationEnum } from '../../domain/entity/enum/postCalification.eum';

interface INotificationPostCalification extends NotificationDocument {
    frontData: {
        postCalification: {
            postCalificationType: PostCalificationEnum
            post: {
                _id: any
                title: string,
                author: string,
                description: string,
                imagesUrls: string[],
                postType: PostType
            }
            contactSeller_id: any
            review?: {
                author: any,
                review: string,
                date: Date,
                rating: number

            }
        }
    };
}


const NotificationPostCalificationSchema = new Schema<INotificationPostCalification>({
    frontData: {
        postCalification: {
            postCalificationType: { type: String, enum: Object.values(PostCalificationEnum), required: true },
            post: {
                _id: { type: String, required: true },
                title: { type: String, required: true },
                author: { type: String, required: true },
                description: { type: String, required: true },
                imagesUrls: [{ type: String, required: true }],
                postType: { type: String, enum: Object.values(PostType), required: true },
            },
            contactSeller_id: { type: String, default: null },
            review: {
                author: { type: String },
                review: { type: String },
                date: { type: Date, default: Date.now() },
                rating: { type: Number, min: 0, max: 5 }
            }
        }
    }
}
)

const NotificationPostCalificationModel = NotificationModel.discriminator('NotificationPostCalification', NotificationPostCalificationSchema);

export { NotificationPostCalificationModel, INotificationPostCalification };