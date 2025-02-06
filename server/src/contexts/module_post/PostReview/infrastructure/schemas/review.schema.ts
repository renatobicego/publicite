import { model, Schema } from 'mongoose';

export interface IPostReviewDocument extends Document {
  author: string;
  review: string;
  date: Date;
  rating: number;
}

export const PostReviewSchema = new Schema<IPostReviewDocument>({
  author: { type: String, required: true },
  review: { type: String, required: true },
  date: { type: Date, required: true },
  rating: { type: Number, required: true },
}
)


const PostReviewModel = model<IPostReviewDocument>('PostReview', PostReviewSchema);

export default PostReviewModel;