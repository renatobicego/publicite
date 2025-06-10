import { ObjectId } from 'mongoose';
import { Magazine } from './magazine.entity';

export class GroupMagazine extends Magazine {
  private allowedCollaborators: string[];
  private group: ObjectId;

  constructor(
    magazine: Magazine,
    allowedCollaborators: string[],
    group: ObjectId,
  ) {
    super(
      magazine.getName,
      magazine.getSections,
      magazine.getOwnerType,
      magazine.getDescription ??
      'Esta revista no posee una descripción de todavía',
      magazine.getId,
    );
    this.allowedCollaborators = allowedCollaborators;
    this.group = group;
  }
}

