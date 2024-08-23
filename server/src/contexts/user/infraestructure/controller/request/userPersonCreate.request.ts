import { ObjectId } from "mongoose";
import { Gender, UserType } from "./enums.request";




export interface UserPersonCreateRequest {
    clerkId: string;
    email: string;
    username: string;
    description: string;
    profilePhotoUrl: string;
    countryRegion: string;
    isActive: boolean;
    contact: ObjectId;
    createdTime: string;
    subscriptions: ObjectId[];
    accountType: ObjectId;
    groups: ObjectId[];
    magazines: ObjectId[];
    board: ObjectId[];
    post: ObjectId[];
    userRelations: ObjectId[];
    userType: UserType;
    name: string;
    lastName: string;
    gender:Gender;
    birthDate: string;
}