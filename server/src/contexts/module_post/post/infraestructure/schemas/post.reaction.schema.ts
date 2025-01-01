import mongoose, { ObjectId, Schema, Types } from 'mongoose';

export const PostReactionSchema = new Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    reaction: { type: String, required: true },
});

export interface PostReactionDocument extends Document {
    user: ObjectId;
    reaction: string;
}

// Creación del modelo
const PostReactionModel = mongoose.model<PostReactionDocument>('PostReaction', PostReactionSchema);

// Exportar el modelo
export default PostReactionModel;