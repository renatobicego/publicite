import { ObjectId } from "mongoose";


export class Post {
  private title: string;
  private postType: string; // debe ser un enum
  private description: string;
  private visibility: string;
  private recomendations: ObjectId;
  private price: number;
  private location: ObjectId;
  private category: ObjectId;
  private comments: ObjectId;
  private attachedFiles: ObjectId;

  constructor(title: string, postType: string, description: string, visibility: string, recomendations: ObjectId, price: number, location: ObjectId,
    category: ObjectId, comments: ObjectId, attachedFiles: ObjectId
  ) {
    this.title = title;
    this.postType = postType;
    this.description = description;
    this.visibility = visibility;
    this.recomendations = recomendations;
    this.price = price;
    this.location = location;
    this.category = category;
    this.comments = comments;
    this.attachedFiles = attachedFiles;
  }




}


