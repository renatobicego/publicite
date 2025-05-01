import { Types, ObjectId } from 'mongoose';

import { UserPreferencesDto_SWAGGER } from './user.preferences.dto.swagger';

export class UserPersonRequestDto_SWAGGER {
  readonly clerkId: string;

  readonly email: string;

  readonly username: string;

  readonly description: string;

  readonly profilePhotoUrl: string;

  readonly countryRegion: string;

  readonly isActive: boolean;

  readonly contact: any;

  readonly createdTime: string;

  readonly userType?: any;

  readonly name: string;

  readonly lastName: string;

  readonly gender: string;

  readonly birthDate: string;

  readonly userPreferences?: UserPreferencesDto_SWAGGER;
}

export class UserPersonResponseDto_SWAGGER {
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

  userType: any;

  name: string;

  lastName: string;

  gender: string;

  birthDate: string;

  userPreferences: UserPreferencesDto_SWAGGER;
}
