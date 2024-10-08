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
  year: { type: Number, required: true },
  brand: { type: String, required: true },
  modelType: { type: String, required: true },
  reviews: [{ type: Schema.Types.ObjectId, ref: 'Review' }],
  condition: { type: String, default: 'new' },
});

// Creamos el discriminador para PostGood basado en el modelo Post
const PostGoodModel = PostModel.discriminator('PostGood', PostGoodSchema);

export { PostGoodModel, IPostGood };
