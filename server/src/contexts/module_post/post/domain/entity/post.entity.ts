import { ObjectId } from 'mongoose';

import { PostRecomendation } from './postRecomendation.entity';

interface Visibility {
  post: string;
  socialMedia: string;
}

interface AttachedFile {
  url: string,
  label: string
}

interface PostLocation {
  location: {
    type: string;
    coordinates: number[]
  }
  userSetted: boolean;
  description: string
  ratio: number
}


export class Post {
  private title: string;
  private searchTitle: string
  private author: string;
  private postType: string;
  private description: string;
  private searchDescription: string
  private visibility: Visibility;
  private recomendations: PostRecomendation[];
  private price: number;
  private geoLocation: PostLocation;
  private category: ObjectId[];
  private comments: ObjectId[];
  private attachedFiles: AttachedFile[];
  private createAt: string;
  private _id?: ObjectId;


  constructor(
    title: string,
    searchTitle: string,
    author: string,
    postType: string,
    description: string,
    searchDescription: string,
    visibility: Visibility,
    recomendations: PostRecomendation[],
    price: number,
    geoLocation: PostLocation,
    category: ObjectId[],
    comments: ObjectId[],
    attachedFiles: AttachedFile[],
    createAt: string,
    _id?: ObjectId,
  ) {
    this.title = title;
    this.searchTitle = searchTitle;
    this.author = author;
    this.postType = postType;
    this.description = description ?? null;
    this.searchDescription = searchDescription;
    this.visibility = visibility;
    this.recomendations = recomendations;
    this.price = price;
    this.geoLocation = geoLocation;
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

  get getSearchTitle() {
    return this.searchTitle;
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

  get getSearchDescription() {
    return this.searchDescription;
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

  get getGeoLocation() {
    return this.geoLocation;
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
