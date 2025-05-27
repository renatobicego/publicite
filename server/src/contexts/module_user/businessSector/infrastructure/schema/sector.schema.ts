import { ObjectId, Schema } from 'mongoose';

export const SectorSchema = new Schema({
  label: { type: String },
  description: { type: String },
});
export interface SectorDocument extends Document {
  label: string;
  description: string;
  _id?: ObjectId;
}
