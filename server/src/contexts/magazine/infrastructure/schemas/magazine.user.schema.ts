import { Schema } from 'mongoose';

import { MagazineDocument, MagazineModel } from './magazine.schema';
interface UserMagazineDocument extends MagazineDocument {
  colaborators: Schema.Types.ObjectId[];
  user: Schema.Types.ObjectId;
  visibility: string;
}

const UserMagazineSchema = new Schema<UserMagazineDocument>({
  colaborators: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  user: { type: Schema.Types.ObjectId, ref: 'User' },
  visibility: { type: String, required: true },
});

const UserMagazineModel = MagazineModel.discriminator(
  'UserMagazine',
  UserMagazineSchema,
);

export { UserMagazineModel, UserMagazineDocument };
