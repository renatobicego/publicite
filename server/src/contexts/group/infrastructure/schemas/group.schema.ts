import { Schema } from 'mongoose';
import { Visibility } from '../../domain/entity/enum/group.visibility.enum';

export const GroupSchema = new Schema({
  members: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  creator: { type: Schema.Types.ObjectId, ref: 'User' },
  admins: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  name: { type: String },
  alias: { type: String, required: true, unique: true },
  rules: { type: String },
  magazines: [{ type: Schema.Types.ObjectId, ref: 'Magazine' }],
  details: { type: String },
  profilePhotoUrl: { type: String },
  visibility: {
    type: String,
    enum: Object.values(Visibility),
    default: 'public',
  },
});

export interface GroupDocument extends Document {
  members: string[];
  admins: string[];
  name: string;
  alias: string;
  creator: string;
  rules: string;
  magazines: string[];
  details: string;
  profilePhotoUrl: string;
  visibility: Visibility;
}

GroupSchema.index({ name: 1 });
GroupSchema.index({ admins: 1 });
