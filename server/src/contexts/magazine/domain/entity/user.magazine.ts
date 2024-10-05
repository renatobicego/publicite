import { ObjectId } from 'mongoose';

import { Magazine } from './magazine.entity';

export class UserMagazine extends Magazine {
  private colaborators: ObjectId[];
  private visibility: string;

  constructor(
    magazine: Magazine,
    colaborators: ObjectId[],
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
    this.colaborators = colaborators;
    this.visibility = visibility;
  }
}
