import { Schema } from 'mongoose';
import { MagazineDocument, MagazineModel } from './magazine.schema';

interface GroupMagazineDocument extends MagazineDocument {
  allowedColaborators: Schema.Types.ObjectId[];
  group: Schema.Types.ObjectId[];
}

export const GroupMagazineSchema = new Schema<GroupMagazineDocument>({
  allowedColaborators: [
    {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  ],
  group: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Group',
    },
  ],
});

const GroupMagazineModel = MagazineModel.discriminator(
  'GroupMagazine',
  GroupMagazineSchema,
);

export { GroupMagazineModel, GroupMagazineDocument };
