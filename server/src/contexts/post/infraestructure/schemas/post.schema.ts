import mongoose, { Schema, Document, Types } from 'mongoose';

export const PostSchema = new Schema({
  title: { type: String, required: true },
  postType: { type: String, required: true }, // deberia ser enum
  description: { type: String, required: true },
  visibility: { type: String, required: true },
  recomendations: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PostRecommendation',
    required: true,
  },
  price: { type: Number, required: true },
  location: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PostLocation',
    required: true,
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PostCategory',
    required: true,
  },
  comments: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PostComment',
    required: true,
  },
  attachedFiles: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PostAttachedFile',
    required: true,
  },
});

export interface PostDocument extends Document {
  title: string;
  postType: string; // debe ser un enum
  description: string;
  visibility: string;
  recomendations: Types.ObjectId;
  price: number;
  location: Types.ObjectId;
  category: Types.ObjectId;
  comments: Types.ObjectId;
  attachedFiles: Types.ObjectId;
}
