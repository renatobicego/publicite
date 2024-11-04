import { model, Schema } from 'mongoose';

interface MagazineSectionDocument extends Document {
  title: string;
  posts: Schema.Types.ObjectId[];
  isFatherSection: boolean;
}

const MagazineSchem = new Schema({
  title: {
    type: String,
  },
  posts: [{ type: Schema.Types.ObjectId, ref: 'Post' }],
  isFatherSection: {
    type: Boolean,
    required: true,
  },
});

const MagazineSectionModel = model<MagazineSectionDocument>(
  'MagazineSection',
  MagazineSchem,
);



export { MagazineSectionModel, MagazineSectionDocument };
