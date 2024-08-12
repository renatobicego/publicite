import { Schema,Document } from 'mongoose';

export const UserSchema = new Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  imageUrl: { type: String, required: true },
});


// Define una interfaz que extiende de Document
export interface UserDocument extends Document {
  firstName: string;
  lastName: string;
  imageUrl: string;
}