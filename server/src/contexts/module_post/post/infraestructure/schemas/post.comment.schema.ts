import mongoose, { ObjectId, Schema, Types } from 'mongoose';

export const PostCommentSchema = new Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    comment: { type: String, required: true },
    isEdited: { type: Boolean, required: true, default: false },
    createdAt: { type: Date, default: () => new Date(Date.now()) },
});


export interface PostCommentDocument extends Document {
    user: ObjectId;
    comment: string;
    isEdited: boolean;
    createdAt: Date;
}

// Creación del modelo
const PostCommentModel = mongoose.model<PostCommentDocument>('PostComment', PostCommentSchema);

// Exportar el modelo
export default PostCommentModel;