import { ObjectId } from 'mongoose';

export class Magazine {
  private name: string;
  private sections: [];
  private ownerType: string;
  private description?: string | null;
  private _id?: ObjectId | undefined;

  constructor(
    name: string,
    sections: [],
    ownerType: string,
    description: string | null,
    _id: ObjectId | undefined,
  ) {
    this.name = name;
    this.sections = sections;
    this.ownerType = ownerType;
    this.description = description;
    this._id = _id;
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

  set setSections(sections: []) {
    this.sections = sections;
  }
}
