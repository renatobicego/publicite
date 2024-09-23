import { ObjectId } from 'mongoose';
import {
  UserType,
  Gender,
} from 'src/contexts/user/domain/entity/enum/user.enums';

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
  name: string;
  lastName: string;
  isActive: boolean;
  contact: ContactRequest;
  createdTime: string;
  userType: UserType;
  userPreferences: UserPreferencesRequest;
}

export interface UserPersonRequest extends UserRequest {
  gender: Gender;
  birthDate: string;
}

export interface UserBusinessRequest extends UserRequest {
  sector: ObjectId;
  businessName: string;
}
