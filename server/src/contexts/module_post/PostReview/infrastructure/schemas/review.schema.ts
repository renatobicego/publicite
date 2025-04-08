import { model, Schema } from 'mongoose';

export interface PostReviewDocument extends Document {
  author: Schema.Types.ObjectId;
  review: string;
  date: Date;
  rating: number;
}

export const PostReviewSchema = new Schema<PostReviewDocument>({
  author: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  review: { type: String, required: true },
  date: { type: Date, required: true },
  rating: { type: Number, required: true },
});

const PostReviewModel = model<PostReviewDocument>(
  'PostReview',
  PostReviewSchema,
);

export default PostReviewModel;
