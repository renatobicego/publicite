import { Schema, model, Document, Date, ObjectId } from 'mongoose';
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
  geoLocation: {
    location: {
      type: string;
      coordinates: [number, number];
    }
    userSetted: boolean;
    description: string;
    ratio: number;
  };
  category: Schema.Types.ObjectId[];
  comments: Schema.Types.ObjectId[];
  attachedFiles: attachedFiles[];
  createAt: string;
  endDate: Date;
  reactions: Schema.Types.ObjectId[];
}

const addDays = (date: any, days: any) => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

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
    geoLocation: {
      location: {
        type: {
          type: String,
          required: true,
        },
        coordinates: {
          type: [Number],
          required: true,
        },
      },
      userSetted: { type: Boolean, required: true },
      description: { type: String, required: true },
      ratio: { type: Number, required: true },
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
    endDate: { type: Date, default: () => addDays(Date.now(), 365) },
    reactions: [
      {
        type: Schema.Types.ObjectId,
        ref: 'PostReaction',
        required: true,
      },
    ],
  },
  {
    discriminatorKey: 'kind',
    collection: 'posts',
    selectPopulatedPaths: false,
  },
);

PostSchema.index({ 'geoLocation.location': '2dsphere' });
PostSchema.index({ searchTitle: 1, searchDescription: 1 });

const PostModel = model<PostDocument>('Post', PostSchema);

export default PostModel;
