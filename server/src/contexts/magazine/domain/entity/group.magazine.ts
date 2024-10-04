import { ObjectId } from 'mongoose';
import { Magazine } from './magazine.entity';

export class GroupMagazine extends Magazine {
  private allowedColaborators: ObjectId[];
  private group: ObjectId[];

  constructor(
    magazine: Magazine,
    allowedColaborators: ObjectId[],
    group: ObjectId[],
  ) {
    super(
      magazine.getName,
      magazine.getSections,
      magazine.getOwnerType,
      magazine.getDescription ??
        'Esta revista no posee una descripción de todavía',
      magazine.getId,
    );
    this.allowedColaborators = allowedColaborators;
    this.group = group;
  }
}

