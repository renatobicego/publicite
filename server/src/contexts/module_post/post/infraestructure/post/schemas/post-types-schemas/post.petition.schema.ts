import { Schema } from 'mongoose';
import PostModel, { PostDocument } from '../post.schema';
import { FrequencyPrice } from 'src/contexts/module_post/post/domain/post/entity/enum/post-service-freq-type.enum';
import { PetitionType } from 'src/contexts/module_post/post/domain/post/entity/enum/post-petition-type.enum';

interface IPostPetition extends PostDocument {
  toPrice: number;
  frequencyPrice: string;
  petitionType: string;
}
// El esquema del discriminador para PostGood
const PostPetitionSchema = new Schema<IPostPetition>({
  toPrice: { type: Number },
  frequencyPrice: {
    type: String,
    enum: Object.values(FrequencyPrice),
  },
  petitionType: {
    type: String,
    enum: Object.values(PetitionType),
    required: true,
  },
});

// Creamos el discriminador para PostGood basado en el modelo Post
const PostPetitionModel = PostModel.discriminator(
  'PostPetition',
  PostPetitionSchema,
);

export { PostPetitionModel, IPostPetition };
