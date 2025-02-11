import { ObjectId } from 'mongoose';

import {
  UserType,
  Gender,
} from 'src/contexts/module_user/user/domain/entity/enum/user.enums';

export interface UserPreferencesRequest {
  searchPreference: ObjectId[] | [];
  backgroundColor: number | undefined;
}

export interface ContactRequest {
  phone?: string;
  instagram?: string;
  facebook?: string;
  x?: string;
  website?: string;
}
export interface UserRequest {
  clerkId: string;
  email: string;
  username: string;
  description: string;
  profilePhotoUrl: string;
  countryRegion: string;
  isActive: boolean;
  name: string;
  lastName: string;
  contact: ContactRequest;
  createdTime: string;
  subscriptions: ObjectId[];
  groups: ObjectId[];
  magazines: ObjectId[];
  board: ObjectId | undefined;
  posts: ObjectId[];
  userRelations: ObjectId[];
  userType: UserType;
  userPreferences: UserPreferencesRequest;
  activeRelations: ObjectId[];
}

export interface UserPersonRequest extends UserRequest {
  gender: Gender;
  birthDate: string;
}

export interface UserBusinessRequest extends UserRequest {
  sector: ObjectId;
  businessName: string;
}
