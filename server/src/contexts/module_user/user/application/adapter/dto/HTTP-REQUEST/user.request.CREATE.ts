import { ObjectId } from 'mongoose';

import {
  UserType,
  Gender,
} from 'src/contexts/module_user/user/domain/entity/enum/user.enums';
import { Visibility } from 'src/contexts/module_user/contact/domain/entity/visibility.enum';

export interface UserPreferencesRequest {
  searchPreference: ObjectId[] | [];
  backgroundColor: number | undefined;
}

export interface ProfesionRequest {
  label?: string;
  visibility?: Visibility;
}

export interface CurriculumRequest {
  ref?: string;
  visibility?: Visibility;
}

export interface DescriptionRequest {
  text?: string;
  visibility?: Visibility;
}

export interface LinkItemRequest {
  url?: string;
  label?: string;
  visibility?: Visibility;
}

export interface ContactRequest {
  phone?: string;
  phoneVisibility?: Visibility;
  instagram?: string;
  instagramVisibility?: Visibility;
  facebook?: string;
  facebookVisibility?: Visibility;
  x?: string;
  xVisibility?: Visibility;
  website?: string;
  websiteVisibility?: Visibility;
  profesion?: ProfesionRequest;
  curriculum?: CurriculumRequest;
  description?: DescriptionRequest;
  links?: LinkItemRequest[];
}
export interface UserRequest {
  clerkId: string;
  email: string;
  username: string;
  description: string;
  profilePhotoUrl: string;
  countryRegion: string;
  isActive: boolean;
  addressPrivacy: string;
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
