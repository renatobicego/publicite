import { Schema } from 'mongoose';

const PostReviewSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  rating: { type: Number, required: true },
  comment: { type: String, required: true },
});
