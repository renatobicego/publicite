import { ObjectId } from 'mongoose';

import { Magazine } from './magazine.entity';

export class UserMagazine extends Magazine {
  private collaborators: ObjectId[];
  private visibility: string;

  constructor(
    magazine: Magazine,
    collaborators: ObjectId[],
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
    this.visibility = visibility;
  }
}
