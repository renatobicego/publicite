import { Schema, Document } from 'mongoose';

export const PostLocationSchema = new Schema({
  location: {
    type: {
      type: String,
      enum: ['Point'],
      required: true,
    },
    coordinates: {
      type: [Number],
      required: true,
    },
  },
  userSetted: { type: Boolean, required: true },
  description: { type: String, required: true },
});

export interface PostLocationDocument extends Document {
  location: {
    type: 'Point';
    coordinates: [number, number];
  };
  userSetted: boolean;
  description: string;
}
