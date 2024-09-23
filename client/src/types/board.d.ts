import { User } from "./userTypes";

export interface Board {
    _id: ObjectId;
    annotations: string[];
    visibility: Visibility;
    keywords: string[];
    user: Pick<User, "username" | "profilePhotoUrl" | "name"> | ObjectId;
    color?: string;
}