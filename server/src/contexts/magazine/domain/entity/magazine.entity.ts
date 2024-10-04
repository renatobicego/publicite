import { ObjectId } from 'mongoose';

export class Magazine {
  private name: string;
  private sections: ObjectId[];
  private ownerType: string;
  private description?: string;
  private _id: ObjectId;

  constructor(
    name: string,
    sections: ObjectId[],
    ownerType: string,
    description: string,
    _id: ObjectId,
  ) {
    (this.name = name),
      (this.sections = sections),
      (this.ownerType = ownerType),
      (this.description =
        description ?? 'Esta revista no posee una descripción de todavía'),
      (this._id = _id);
  }

  get getName() {
    return this.name;
  }

  get getSections() {
    return this.sections;
  }

  get getOwnerType() {
    return this.ownerType;
  }

  get getDescription() {
    return this.description;
  }

  get getId() {
    return this._id;
  }
}
