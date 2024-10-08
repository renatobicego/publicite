import { ObjectId, Schema } from 'mongoose';
import PostModel, { PostDocument } from '../post.schema';
import { FrequencyPrice } from 'src/contexts/post/domain/entity/enum/post-service-freq-type.enum';

interface IPostService extends PostDocument {
  frequencyPrice: string;
  imagesUrls: string[];
  reviews: ObjectId[];
}
// El esquema del discriminador para PostGood
const PostServiceSchema = new Schema<IPostService>({
  frequencyPrice: {
    type: String,
    enum: Object.values(FrequencyPrice),
    required: true,
  },
  reviews: [{ type: Schema.Types.ObjectId, ref: 'Review' }],
  imagesUrls: [{ type: String, required: true }],
});

// Creamos el discriminador para PostGood basado en el modelo Post
const PostServiceModel = PostModel.discriminator(
  'PostService',
  PostServiceSchema,
);

export { PostServiceModel, IPostService };
