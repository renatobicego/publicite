import { User } from "./userTypes";

export interface Board {
  _id: ObjectId;
  annotations: string[];
  visibility: Visibility;
  keywords: string[];
  user: Pick<User, "username" | "profilePhotoUrl" | "name">;
  color?: string;
}

export interface PostBoard extends Omit<Board, "_id" | "user"> {
  user: ObjectId;
}
