import { ObjectId, Schema } from 'mongoose';
import PostModel, { PostDocument } from '../post.schema';

interface IPostGood extends PostDocument {
  imagesUrls: string[];
  year: number;
  brand: string;
  modelType: string;
  reviews: ObjectId[];
  condition: string;
}
// El esquema del discriminador para PostGood
const PostGoodSchema = new Schema<IPostGood>({
  imagesUrls: [{ type: String, required: true }],
  year: { type: Number },
  brand: { type: String },
  modelType: { type: String },
  reviews: [{ type: Schema.Types.ObjectId, ref: 'PostReview' }],
  condition: { type: String, default: 'new' },
});

// Creamos el discriminador para PostGood basado en el modelo Post
const PostGoodModel = PostModel.discriminator('PostGood', PostGoodSchema);

export { PostGoodModel, IPostGood };
