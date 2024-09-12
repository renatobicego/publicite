import { Schema, Document } from 'mongoose';

export const PostLocation = new Schema({
  latitude: { type: String, required: true },
  longitude: { type: String, required: true },
});

export interface PostLocationDocument extends Document {
  latitude: string;
  longitude: string;
}
