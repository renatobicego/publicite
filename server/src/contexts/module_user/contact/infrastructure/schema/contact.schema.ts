import { Schema } from 'mongoose';

export const ContactSchema = new Schema({
  phone: { type: String },
  instagram: { type: String },
  facebook: { type: String },
  x: { type: String },
  website: { type: String },
});
export interface ContactDocument extends Document {
  phone: string;
  instagram: string;
  facebook: string;
  x: string;
  website: string;
}
