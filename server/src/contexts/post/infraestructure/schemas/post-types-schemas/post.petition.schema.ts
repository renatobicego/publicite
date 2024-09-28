import { Schema } from 'mongoose';
import PostModel, { PostDocument } from '../post.schema';
import { frequencyPrice } from 'src/contexts/post/domain/entity/enum/post-service-freq-type.enum';
import { petitionType } from 'src/contexts/post/domain/entity/enum/post-petition-type.enum';

interface IPostPetition extends PostDocument {
  toPrice: number;
  frequencyPrice: string;
  petitionType: string;
}
// El esquema del discriminador para PostGood
const PostPetitionSchema = new Schema<IPostPetition>({
  toPrice: { type: Number, required: true },
  frequencyPrice: {
    type: String,
    enum: Object.values(frequencyPrice),
    required: true,
  },
  petitionType: {
    type: String,
    enum: Object.values(petitionType),
    required: true,
  },
});

// Creamos el discriminador para PostGood basado en el modelo Post
const PostPetitionModel = PostModel.discriminator(
  'PostPetition',
  PostPetitionSchema,
);

export { PostPetitionModel, IPostPetition };
