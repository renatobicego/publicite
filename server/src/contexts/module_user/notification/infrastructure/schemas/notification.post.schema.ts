import { Schema } from 'mongoose';
import NotificationModel, { NotificationDocument } from "./notification.schema";

interface INotificationPost extends NotificationDocument {
    frontData: {
        postReaction: {
            user: {
                username: string;
            },
            post: {
                postId: string;
                title: string;
                imageUrl: string;
            }
            emoji: string;
        }
    }
}


const NotificationPostSchema = new Schema<INotificationPost>({
    frontData: {
        postReaction: {
            user: {
                username: { type: String, required: true },
            },
            post: {
                postId: { type: String, required: true },
                title: { type: String, required: true },
                imageUrl: { type: String, required: true },
            },
            emoji: { type: String, required: true }
        }
    }
})

const NotificationPostModel = NotificationModel.discriminator('NotificationPost', NotificationPostSchema);

export { NotificationPostModel, INotificationPost };