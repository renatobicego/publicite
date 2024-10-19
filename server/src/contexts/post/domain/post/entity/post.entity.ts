import { ObjectId } from 'mongoose';
import { PostLocation } from './postLocation.entity';
import { PostRecomendation } from './postRecomendation.entity';

export interface Visibility {
  post: string;
  socialMedia: string;
}

export class Post {
  private title: string;
  private author: ObjectId;
  private postType: string;
  private description: string;
  private visibility: Visibility;
  private recomendations: PostRecomendation[];
  private price: number;
  private location: PostLocation;
  private category: ObjectId[];
  private comments: ObjectId[];
  private attachedFiles: { url: string; label: string }[];
  private createAt: string;
  private _id?: ObjectId;

  constructor(
    title: string,
    author: ObjectId,
    postType: string,
    description: string,
    visibility: Visibility,
    recomendations: PostRecomendation[],
    price: number,
    location: PostLocation,
    category: ObjectId[],
    comments: ObjectId[],
    attachedFiles: [],
    createAt: string,
    _id?: ObjectId,
  ) {
    this.title = title;
    this.author = author;
    this.postType = postType;
    this.description = description ?? null;
    this.visibility = visibility;
    this.recomendations = recomendations;
    this.price = price;
    this.location = location;
    this.category = category;
    this.comments = comments;
    this.attachedFiles = attachedFiles;
    this.createAt = createAt;
    this._id = _id;
  }

  get getId() {
    return this._id;
  }

  get getTitle() {
    return this.title;
  }

  get getAuthor() {
    return this.author;
  }

  get getPostType() {
    return this.postType;
  }

  get getDescription() {
    return this.description;
  }

  get getVisibility() {
    return this.visibility;
  }

  get getRecomendations() {
    return this.recomendations;
  }

  get getPrice() {
    return this.price;
  }

  get getLocation() {
    return this.location;
  }

  get getCategory() {
    return this.category;
  }

  get getComments() {
    return this.comments;
  }

  get getAttachedFiles() {
    return this.attachedFiles;
  }

  get getCreateAt() {
    return this.createAt;
  }
}
