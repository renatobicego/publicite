import { ObjectId } from 'mongoose';
import { ContactRespose } from './user.contact.response';

export interface UserResponse {
  _id: ObjectId;
  clerkId: string;
  email: string;
  username: string;
  description: string;
  profilePhotoUrl: string;
  countryRegion: string;
  isActive: boolean;
  userType: string;
  contact: ObjectId;
  createdTime: string;
  subscriptions: ObjectId[];
  groups: ObjectId[];
  magazines: ObjectId[];
  board: ObjectId | undefined;
  posts: ObjectId[];
  userRelations: ObjectId[];
  name: string;
  lastName: string;
  userPreferences: {
    searchPreference: ObjectId[];
    backgroundColor: number;
  };
  notifications: any[];
  friendRequests: any[];

}

export interface UserPersonResponse extends UserResponse {
  gender: string;
  birthDate: string;
}

export interface UserBusinessResponse extends UserResponse {
  sector: ObjectId;
  businessName: string;
}

export interface UserFindAllResponse {
  user: {
    _id: ObjectId;
    profilePhotoUrl: string;
    username: string;
    contact: ContactRespose; 
    countryRegion: string;
    userType: string;
    businessName?: string;
    lastName: string;
    name: string;
  }[]; // Ahora es un arreglo de usuarios
  hasMore?: boolean; // Indica si hay más usuarios
}
