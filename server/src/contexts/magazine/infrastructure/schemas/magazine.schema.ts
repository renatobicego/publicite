import { Schema, model, Document } from 'mongoose';
import { OwnerType } from '../../domain/entity/enum/magazine.ownerType.enum';

interface MagazineDocument extends Document {
  name: string;

  sections: Schema.Types.ObjectId[];
  ownerType: OwnerType;
  description?: string;
}

const MagazineSchema = new Schema<MagazineDocument>(
  {
    name: { type: String, required: true },
    sections: [{ type: Schema.Types.ObjectId, ref: 'MagazineSection' }],
    ownerType: { type: String, enum: Object.values(OwnerType), required: true },
    description: {
      type: String,
    },
  },
  {
    discriminatorKey: 'kind',
    collection: 'magazines',
    selectPopulatedPaths: false,
  },
);

//Aca creamoos un modelo en mongo llamado Magazine, se basa en el schema de arriba
// y esta tipado como magazineDocument
const MagazineModel = model<MagazineDocument>('Magazine', MagazineSchema);

export { MagazineModel, MagazineDocument, MagazineSchema };
