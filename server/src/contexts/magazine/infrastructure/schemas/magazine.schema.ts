import { Schema, model, Document } from 'mongoose';

interface MagazineDocument extends Document {
  name: string;
  sections: Schema.Types.ObjectId[];
  ownerType: string;
  description?: string;
}

const MagazineSchema = new Schema<MagazineDocument>({
  name: { type: String, required: true },
  sections: [{ type: Schema.Types.ObjectId, ref: 'MagazineSection' }],
  ownerType: { type: String, required: true },
  description: {
    type: String,
    default: 'Esta revista no posee una descripción de todavía',
  },
});

//Aca creamoos un modelo en mongo llamado Magazine, se basa en el schema de arriba
// y esta tipado como magazineDocument
const MagazineModel = model<MagazineDocument>('Magazine', MagazineSchema);

export { MagazineModel, MagazineDocument };

