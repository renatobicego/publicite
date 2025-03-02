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

MagazineSchema.pre(
  'deleteMany',
  { document: false, query: true },
  async function (next) {
    const docs = await this.model.find(this.getFilter());
    const sectionsToDelete: any[] = []
    for (let i = 0; i < docs.length; i++) {
      for (let j = 0; j < docs[i].sections.length; j++) {
        sectionsToDelete.push(docs[i].sections[j])
      }
    }
    await docs[0].model('MagazineSection').deleteMany({ _id: { $in: sectionsToDelete } });

    next();
  },
);


MagazineSchema.index({ sections: 1 });

//Aca creamoos un modelo en mongo llamado Magazine, se basa en el schema de arriba
// y esta tipado como magazineDocument
const MagazineModel = model<MagazineDocument>('Magazine', MagazineSchema);

export { MagazineModel, MagazineDocument, MagazineSchema };
