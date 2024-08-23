import { ObjectId } from "mongoose";
/*
Entidad para el user en general.
*/
enum UserType {
  Personal = 'Personal',
  Business = 'Business'
}

export abstract class User {
  private clerkId: string;
  private email: string;
  private username: string;
  private description: string;
  private profilePhotoUrl: string;
  private countryRegion: string;
  private isActive: boolean;
  private contact: ObjectId;
  private createdTime: string;
  private subscriptions: ObjectId[];
  private accountType: ObjectId;
  private groups: ObjectId[];
  private magazines: ObjectId[];
  private board: ObjectId[];
  private post: ObjectId[];
  private userRelations: ObjectId[];
  private userType: UserType;
}
