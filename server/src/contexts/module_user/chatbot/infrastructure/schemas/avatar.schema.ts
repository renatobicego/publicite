import { Document, Schema } from 'mongoose';

export interface AvatarDocument extends Document {
  userId: string;
  name: string;
  context: string;
  seed: string;
  createdAt: Date;
  updatedAt: Date;
}

export const AvatarSchema = new Schema(
  {
    userId: { type: String, required: true, index: true },
    name: { type: String, required: true, maxlength: 60, trim: true },
    context: { type: String, required: true, maxlength: 1000, trim: true },
    // Semilla de la imagen (Blobatar). Es el _id del avatar, así la imagen es
    // única y estable sin guardar ningún archivo.
    seed: { type: String, required: true },
  },
  { timestamps: true, collection: 'avatars' },
);

// Un usuario no puede tener dos avatares con el mismo nombre.
AvatarSchema.index({ userId: 1, name: 1 }, { unique: true });
