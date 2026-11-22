import { ObjectId, Schema } from 'mongoose';
import PostModel, { PostDocument } from '../post.schema';
import { FrequencyPrice } from 'src/contexts/module_post/post/domain/entity/enum/post-service-freq-type.enum';
import {
  AdSpaceBand,
  AdSpaceCoverage,
  AdSpaceEdition,
  AdSpaceMedium,
} from 'src/contexts/module_post/post/domain/entity/enum/post-adspace.enums';
import { AdSpaceData } from 'src/contexts/module_post/post/application/functions/adSpace';

interface IPostAdSpace extends PostDocument {
  frequencyPrice: string;
  imagesUrls: string[];
  reviews: ObjectId[];
  adSpace: AdSpaceData;
}

const AdSpaceSchema = new Schema(
  {
    medium: { type: String, enum: Object.values(AdSpaceMedium), required: true },
    mediaName: { type: String, required: true },
    audience: { type: String, default: null },
    formats: { type: [String], default: [] },
    mediaUrl: { type: String, default: null },
    coverageArea: { type: String, enum: [...Object.values(AdSpaceCoverage), null] },
    coverageName: { type: String },
    placeAddress: { type: String },
    band: { type: String, enum: [...Object.values(AdSpaceBand), null] },
    frequency: { type: String },
    platform: { type: String },
    program: { type: String },
    schedule: { type: String },
    outdoorType: { type: String },
    dimensions: { type: String },
    illuminated: { type: Boolean },
    edition: { type: String, enum: [...Object.values(AdSpaceEdition), null] },
    periodicity: { type: String },
    circulation: { type: String },
    section: { type: String },
    networks: { type: [String], default: undefined },
    handle: { type: String },
    followers: { type: Number },
    engagement: { type: String },
  },
  { _id: false },
);

const PostAdSpaceSchema = new Schema<IPostAdSpace>({
  frequencyPrice: {
    type: String,
    enum: Object.values(FrequencyPrice),
  },
  reviews: [{ type: Schema.Types.ObjectId, ref: 'PostReview' }],
  imagesUrls: [{ type: String, required: true }],
  adSpace: { type: AdSpaceSchema, required: true },
});

// Sub-solapas de Explorar (por medio).
PostAdSpaceSchema.index({ 'adSpace.medium': 1 });

const PostAdSpaceModel = PostModel.discriminator(
  'PostAdSpace',
  PostAdSpaceSchema,
);

export { PostAdSpaceModel, IPostAdSpace };
