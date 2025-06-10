import { IsOptional } from 'class-validator';
import { ObjectId } from 'mongoose';

import { UserPreferencesDto_SWAGGER } from './user.preferences.dto.swagger';

export class UserBusinessRequestDto_SWAGGER {
  readonly clerkId: string;

  readonly email: string;

  readonly username: string;

  readonly description: string;

  readonly profilePhotoUrl: string;

  readonly countryRegion: string;

  readonly isActive: boolean;

  readonly contact: any;

  readonly createdTime: string;

  readonly userType: string;

  readonly sector: ObjectId;

  readonly name: string;

  readonly lastName: string;

  readonly businessName: string;

  readonly userPreferences?: UserPreferencesDto_SWAGGER;
}

export class UserBusinessResponseDto_SWAGGER {
  readonly _id: ObjectId;

  readonly clerkId: string;

  readonly email: string;

  readonly username: string;

  readonly description: string;

  readonly profilePhotoUrl: string;

  readonly countryRegion: string;

  readonly isActive: boolean;

  readonly contact: any;

  readonly createdTime: string;

  @IsOptional()
  readonly subscriptions?: ObjectId[];

  @IsOptional()
  readonly groups?: ObjectId[];

  @IsOptional()
  readonly magazines?: ObjectId[];

  @IsOptional()
  readonly board?: ObjectId[];

  @IsOptional()
  readonly post?: ObjectId[];

  @IsOptional()
  readonly userRelations?: ObjectId[];

  readonly userType?: string;

  readonly sector: ObjectId;

  readonly name: string;

  readonly lastName: string;

  readonly businessName: string;

  readonly userPreferences: UserPreferencesDto_SWAGGER;
}
