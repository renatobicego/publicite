import { Schema } from 'mongoose';

export const BoardSchema = new Schema({
  annotations: [{ type: String }],
  visibility: { type: String },
  user: { type: Schema.Types.ObjectId, ref: 'User' },
  color: { type: String },
});

export interface BoardDocument extends Document {
  annotations: string[];
  visibility: string;
  user: Schema.Types.ObjectId;
  color: string;
}
