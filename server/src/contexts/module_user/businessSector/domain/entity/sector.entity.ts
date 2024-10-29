import { ObjectId } from 'mongoose';
import { SectorDocument } from '../../infrastructure/schema/sector.schema';

export class Sector {
  private _id?: ObjectId;
  private label: string;
  private description: string;

  constructor(label: string, description: string, id?: ObjectId) {
    this.label = label;
    this.description = description;
    this._id = id as unknown as ObjectId;
  }

  static formatDocumentToClass(document: SectorDocument): Sector {
    return new Sector(document.label, document.description, document._id);
  }

  getId(): ObjectId {
    return this._id as unknown as ObjectId;
  }

  getLabel(): string {
    return this.label;
  }

  getDescription(): string {
    return this.description;
  }
}
