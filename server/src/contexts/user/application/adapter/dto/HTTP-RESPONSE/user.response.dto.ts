import { ObjectId } from 'mongoose';

export interface UserResponse {
  _id: ObjectId;
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
  groups: ObjectId[];
  magazines: ObjectId[];
  board: ObjectId[];
  post: ObjectId[];
  userRelations: ObjectId[];
  userType: string;
  name: string;
  lastName: string;
  userPreferences: {
    searchPreference: ObjectId[];
    backgroundColor: number;
  };
}

export interface UserPersonResponse extends UserResponse {
  gender: string;
  birthDate: string;
}

export interface UserBusinessResponse extends UserResponse {
  sector: ObjectId;
  businessName: string;
}
