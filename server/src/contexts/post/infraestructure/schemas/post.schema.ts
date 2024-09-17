import mongoose, { Schema, Document, Types } from 'mongoose';
import { PostType } from '../../domain/entity/enum/post-type.enum';
import { PostLocation } from '../../domain/entity/postLocation.entity';
import { Visibility } from '../../domain/entity/enum/post-visibility.enum';

export interface attachedFiles {
  url: string;
  label: string;
}

export const PostSchema = new Schema({
  title: { type: String, required: true },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  postType: { type: String, enum: Object.values(PostType), required: true },
  description: { type: String, required: true },
  visibility: {
    post: { type: String, enum: Object.values(Visibility), required: true },
    socialMedia: {
      type: String,
      enum: Object.values(Visibility),
      required: true,
    },
  },
  recomendations: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'PostRecommendation',
      required: true,
    },
  ],
  price: { type: Number, required: true },
  location: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PostLocation',
    required: true,
  },
  category: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'PostCategory',
      required: true,
    },
  ],
  comments: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'PostComment',
      required: true,
    },
  ],
  attachedFiles: [
    {
      url: { type: String, default: '' },
      label: { type: String, default: '' },
    },
  ],
  createAt: { type: String, required: true },
});

PostSchema.index({ location: '2d' });

export interface PostDocument extends Document {
  title: string;
  author: Types.ObjectId;
  postType: string;
  description: string;
  visibility: {
    post: string;
    socialMedia: string;
  };
  recomendations: Types.ObjectId[];
  price: number;
  location: PostLocation;
  category: Types.ObjectId[];
  comments: Types.ObjectId[];
  attachedFiles: attachedFiles[];
  createAt: string;
}
