import { Schema } from 'mongoose';
import NotificationModel, { NotificationDocument } from "./notification.schema";
import { PostType } from '../../domain/entity/enum/post.type.enum';

interface INotificationPost extends NotificationDocument {
    frontData: {
        postActivity: {
            postReaction: {
                emoji: string;
            }
            user: {
                username: string;
            },
            post: {
                _id: string;
                title: string;
                imageUrl: string;
                postType: string;
            }
        }
    }
}


const NotificationPostSchema = new Schema<INotificationPost>({
    frontData: {
        postActivity: {
            user: {
                username: { type: String, required: true },
            },
            post: {
                _id: { type: String, required: true },
                title: { type: String, required: true },
                imageUrl: { type: String, required: true },
                postType: { type: String, enum: Object.values(PostType), required: true },
            },
            postReaction: { emoji: { type: String, required: true } }
        }
    }
})

const NotificationPostModel = NotificationModel.discriminator('NotificationPost', NotificationPostSchema);

export { NotificationPostModel, INotificationPost };