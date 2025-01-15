import mongoose, { ObjectId, Schema, Types } from 'mongoose';

export const PostCommentSchema = new Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    comment: { type: String, required: true },
});

export interface PostCommentDocument extends Document {
    user: ObjectId;
    comment: string;
}

// Creación del modelo
const PostCommentModel = mongoose.model<PostCommentDocument>('PostComment', PostCommentSchema);

// Exportar el modelo
export default PostCommentModel;