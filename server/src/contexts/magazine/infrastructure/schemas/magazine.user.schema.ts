import { Schema, model, Document } from 'mongoose';

import { MagazineDocument } from './magazine.schema';
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

const UserMagazineModel = model<UserMagazineDocument>(
  'UserMagazine',
  UserMagazineSchema,
);

export { UserMagazineModel, UserMagazineDocument };

