import { Schema, model, Document } from 'mongoose';

export const PostCategorySchema = new Schema({
  label: { type: String, required: true },
});

export const PostCategory = model('PostCategory', PostCategorySchema);

export interface PostCategoryDocument extends Document {
  label: string;
}
