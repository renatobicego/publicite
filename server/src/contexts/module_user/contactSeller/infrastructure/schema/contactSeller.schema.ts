import { model, Schema } from "mongoose"

interface ContactSellerDocument extends Document {
    client: {
        clientId: any,
        name: string,
        email: string,
        lastName: string,
        username: string,
        phone: string,
        message: string
    }
    post: Schema.Types.ObjectId,
    notification_id: Schema.Types.ObjectId,
    owner: Schema.Types.ObjectId,
    date: Date,
    isOpinionRequested: boolean
    isOpinionRequestAvailable: boolean
}

const ContactSellerSchema = new Schema<ContactSellerDocument>({
    client: {
        clientId: { type: Schema.Types.ObjectId, ref: 'User' },
        name: { type: String, required: true },
        email: { type: String, required: true },
        lastName: { type: String, required: true },
        username: { type: String, default: null },
        phone: { type: String, default: null },
        message: { type: String, required: true },
    },
    post: { type: Schema.Types.ObjectId, ref: 'Post' },
    notification_id: { type: Schema.Types.ObjectId, ref: 'Notification' },
    owner: { type: Schema.Types.ObjectId, ref: 'User' },
    date: { type: Date, required: true },
    isOpinionRequested: { type: Boolean, required: true },
    isOpinionRequestAvailable: { type: Boolean, required: true }




})

const ContactSellerModel = model<ContactSellerDocument>('ContactSeller', ContactSellerSchema);

export { ContactSellerModel, ContactSellerDocument };