import { Schema, model, Document } from 'mongoose';
import { PostType } from '../../domain/entity/enum/post-type.enum';

import { Visibility } from '../../domain/entity/enum/post-visibility.enum';

export interface attachedFiles {
  url: string;
  label: string;
}

export interface PostDocument extends Document {
  title: string;
  searchTitle: string;
  author: string;
  postType: string;
  description: string;
  searchDescription: string;
  visibility: {
    post: string;
    socialMedia: string;
  };
  recomendations: Schema.Types.ObjectId[];
  price: number;
  location: Schema.Types.ObjectId;
  category: Schema.Types.ObjectId[];
  comments: Schema.Types.ObjectId[];
  attachedFiles: attachedFiles[];
  createAt: string;
}

export const PostSchema = new Schema<PostDocument>(
  {
    title: { type: String, required: true },
    searchTitle: { type: String, required: true },
    author: {
      type: String,
      ref: 'User',
      required: true,
    },
    postType: { type: String, enum: Object.values(PostType), required: true },
    description: { type: String },
    searchDescription: { type: String },
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
        type: Schema.Types.ObjectId,
        ref: 'PostRecommendation',
        required: true,
      },
    ],
    price: { type: Number, required: true },
    location: {
      type: Schema.Types.ObjectId,
      ref: 'PostLocation',
      required: true,
    },
    category: [
      {
        type: Schema.Types.ObjectId,
        ref: 'PostCategory',
        required: true,
      },
    ],
    comments: [
      {
        type: Schema.Types.ObjectId,
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
  },
  {
    discriminatorKey: 'kind',
    collection: 'posts',
    selectPopulatedPaths: false,
  },
);

PostSchema.index({ location: '2d' });

PostSchema.index({ location: '2d' });
PostSchema.index({ title: 'text', description: 'text' });


PostSchema.index({ title: 1, description: 1 });



const PostModel = model<PostDocument>('Post', PostSchema);

export default PostModel;
