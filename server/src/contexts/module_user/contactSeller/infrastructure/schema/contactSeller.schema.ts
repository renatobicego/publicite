import { model, Schema } from "mongoose"

interface ContactSellerDocument extends Document {
    client: {
        _id: string,
        name: string,
        email: string,
        lastName: string,
        username: string,
        phone: string,
        message: string
    }
    post: {
        _id: Schema.Types.ObjectId,
    }
}

const ContactSellerSchema = new Schema<ContactSellerDocument>({
    client: {
        _id: { type: String, required: true },
        name: { type: String, required: true },
        email: { type: String, required: true },
        lastName: { type: String, required: true },
        username: { type: String, default: null },
        phone: { type: String, default: null },
        message: { type: String, required: true },
    },
    post: {
        _id: { type: Schema.Types.ObjectId, ref: 'Post' },
    }



})

const ContactSellerModel = model<ContactSellerDocument>('ContactSeller', ContactSellerSchema);

export { ContactSellerModel, ContactSellerDocument };