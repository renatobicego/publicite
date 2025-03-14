import { ObjectId } from 'mongoose';

import { PostRecomendation } from './postRecomendation.entity';

interface Visibility {
  post: string;
  socialMedia: string;
}

interface AttachedFile {
  url: string;
  label: string;
}

interface PostLocation {
  location: {
    type: string;
    coordinates: number[];
  };
  userSetted: boolean;
  description: string;
  ratio: number;
}

export class Post {
  private title: string;
  private searchTitle: string;
  private author: string;
  private postType: string;
  private description: string;
  private searchDescription: string;
  private visibility: Visibility;
  private recomendations: PostRecomendation[];
  private price: number;
  private geoLocation: PostLocation;
  private category: ObjectId[];
  private comments: ObjectId[];
  private attachedFiles: AttachedFile[];
  private createAt: string;
  private reactions: ObjectId[];
  private postBehaviourType: string;
  private isActive: boolean;
  private _id?: ObjectId;
  private endDate?: Date;

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
    reactions: ObjectId[],
    postBehaviourType: string,
    isActive: boolean,
    _id?: ObjectId,
    endDate?: Date,
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
    this.reactions = reactions;
    this.postBehaviourType = postBehaviourType;
    this.isActive = isActive;
    this._id = _id;
    this.endDate = endDate;
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

  get getReactions() {
    return this.reactions;
  }

  get getPostBehaviourType() {
    return this.postBehaviourType;
  }

  get getIsActive() {
    return this.isActive;
  }

  get getEndDate() {
    return this.endDate;
  }
}
