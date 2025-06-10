import { ObjectId } from 'mongoose';

import { Magazine } from './magazine.entity';

export class UserMagazine extends Magazine {
  private collaborators: ObjectId[];
  private user: string;
  private visibility: string;

  constructor(
    magazine: Magazine,
    collaborators: ObjectId[],
    user: string,
    visibility: string,
  ) {
    super(
      magazine.getName,
      magazine.getSections,
      magazine.getOwnerType,
      magazine.getDescription ??
      'Esta revista no posee una descripción de todavía',
      magazine.getId,
    );
    this.collaborators = collaborators;
    this.user = user;
    this.visibility = visibility;
  }

  get getUser() {
    return this.user;
  }
}
