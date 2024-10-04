import { ObjectId } from 'mongoose';
import { Magazine } from '../magazine.entity';

export class MagazineSection extends Magazine {
  private title: string;
  private posts: ObjectId[];
  private isFatherSection: boolean;

  constructor(
    magazine: Magazine,
    title: string,
    posts: ObjectId[],
    isFatherSection: boolean,
  ) {
    super(
      magazine.getName,
      magazine.getSections,
      magazine.getOwnerType,
      magazine.getDescription ??
        'Esta revista no posee una descripción de todavía',
      magazine.getId,
    );
    this.title = title;
    this.posts = posts;
    this.isFatherSection = isFatherSection;
  }
}

