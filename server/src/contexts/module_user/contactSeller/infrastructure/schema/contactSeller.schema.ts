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
        _id: string,
        title: string,
        imagesUrls: string,
        price: number
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
        _id: { type: String, required: true },
        title: { type: String, required: true },
        imagesUrls: { type: String, required: true },
        price: { type: Number, required: true },
    }



})

const ContactSellerModel = model<ContactSellerDocument>('ContactSeller', ContactSellerSchema);

export { ContactSellerModel, ContactSellerDocument };