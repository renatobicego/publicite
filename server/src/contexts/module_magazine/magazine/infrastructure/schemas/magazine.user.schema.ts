import { Schema } from 'mongoose';

import { MagazineDocument, MagazineModel } from './magazine.schema';
interface UserMagazineDocument extends MagazineDocument {
  collaborators: Schema.Types.ObjectId[];
  user: Schema.Types.ObjectId;
  visibility: string;
}

const UserMagazineSchema = new Schema<UserMagazineDocument>({
  collaborators: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  visibility: { type: String, required: true },
});

const UserMagazineModel = MagazineModel.discriminator(
  'UserMagazine',
  UserMagazineSchema,
);

export { UserMagazineModel, UserMagazineDocument };
