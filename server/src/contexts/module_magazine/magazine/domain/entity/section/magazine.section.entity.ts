import { ObjectId } from 'mongoose';

export class MagazineSection {
  private title: string;
  private posts: ObjectId[];
  private isFatherSection: boolean;

  constructor(title: string, posts: ObjectId[], isFatherSection: boolean) {
    this.title = title;
    this.posts = posts;
    this.isFatherSection = isFatherSection;
  }
}
