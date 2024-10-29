import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Types, ObjectId } from 'mongoose';

import { UserPreferencesDto_SWAGGER } from './user.preferences.dto.swagger';

export class UserPersonRequestDto_SWAGGER {
  @ApiProperty({
    description: 'ID of the user in clerk',
    example: '5f9d8f5e9d8f5e9d8f5e9d8f',
    type: String,
  })
  readonly clerkId: string;

  @ApiProperty({
    description: 'email of the user',
    example: 'maxi@dutsiland.com',
    type: String,
  })
  readonly email: string;

  @ApiProperty({
    description: 'username of the user',
    example: 'mcvetic97',
    type: String,
  })
  readonly username: string;

  @ApiProperty({
    description: 'Description of the user',
    example: 'I like to code',
    type: String,
  })
  readonly description: string;

  @ApiProperty({
    description: 'Profile photo URL of the user',
    example: 'https://your-bucket.com/profile.jpg',
    type: String,
  })
  readonly profilePhotoUrl: string;

  @ApiProperty({
    description: 'Country of the user',
    example: 'Argentina',
    type: String,
  })
  readonly countryRegion: string;

  @ApiProperty({
    description: 'Is the user active?',
    example: 'true',
    type: Boolean,
  })
  readonly isActive: boolean;

  @ApiProperty({
    description: 'ID of the schema - contact',
    example: '5f9d8f5e9d8f5e9d8f5e9d8f',
    type: Types.ObjectId,
  })
  readonly contact: any;

  @ApiProperty({
    description: 'Created time of the user',
    example: '2024-10-10',
    type: String,
  })
  readonly createdTime: string;

  @ApiProperty({
    description: 'Type of the user',
    example: 'Person',
    type: String,
  })
  readonly userType?: any;

  @ApiProperty({
    description: 'Name of the user',
    example: 'Renato',
    type: String,
  })
  readonly name: string;

  @ApiProperty({
    description: 'Last name of the user',
    example: 'Bicego',
    type: String,
  })
  readonly lastName: string;

  @ApiProperty({
    description: 'Gender of the user',
    example: " 'M' | 'F | 'X' | 'O' ",
    type: String,
  })
  readonly gender: string;

  @ApiProperty({
    description: 'Birth date of the user',
    example: '2024-10-10',
    type: String,
  })
  readonly birthDate: string;

  @ApiPropertyOptional({
    description: 'User preferences object',
  })
  readonly userPreferences?: UserPreferencesDto_SWAGGER;
}

export class UserPersonResponseDto_SWAGGER {
  @ApiProperty({
    description: 'ID of the user in clerk',
    example: '5f9d8f5e9d8f5e9d8f5e9d8f',
    type: Types.ObjectId,
  })
  _id: ObjectId;

  @ApiProperty({
    description: 'ID of the user in clerk',
    example: '5f9d8f5e9d8f5e9d8f5e9d8f',
    type: String,
  })
  clerkId: string;

  @ApiProperty({
    description: 'email of the user',
    example: 'maxi@dutsiland.com',
    type: String,
  })
  email: string;

  @ApiProperty({
    description: 'username of the user',
    example: 'mcvetic97',
    type: String,
  })
  username: string;

  @ApiProperty({
    description: 'Description of the user',
    example: 'I like to code',
    type: String,
  })
  description: string;

  @ApiProperty({
    description: 'Profile photo URL of the user',
    example: 'https://your-bucket.com/profile.jpg',
    type: String,
  })
  profilePhotoUrl: string;

  @ApiProperty({
    description: 'Country region of the user',
    example: 'Spain',
    type: String,
  })
  countryRegion: string;

  @ApiProperty({
    description: 'isActive of the user',
    example: 'true',
    type: Boolean,
  })
  isActive: boolean;

  @ApiProperty({
    description: 'contact of the user',
    example: '5f9d8f5e9d8f5e9d8f5e9d8f',
    type: Types.ObjectId,
  })
  contact: ObjectId;

  @ApiProperty({
    description: 'createdTime of the user',
    example: '2020-01-01T00:00:00.000Z',
    type: Date,
  })
  createdTime: string;

  @ApiProperty({
    description: 'subscriptions of the user',
    example: '5f9d8f5e9d8f5e9d8f5e9d8f',
    type: [Types.ObjectId],
  })
  subscriptions: ObjectId[];

  @ApiProperty({
    description: 'groups of the user',
    example: '5f9d8f5e9d8f5e9d8f5e9d8f',
    type: [Types.ObjectId],
  })
  groups: ObjectId[];

  @ApiProperty({
    description: 'magazines of the user',
    example: '5f9d8f5e9d8f5e9d8f5e9d8f',
    type: [Types.ObjectId],
  })
  magazines: ObjectId[];

  @ApiProperty({
    description: 'board of the user',
    example: '5f9d8f5e9d8f5e9d8f5e9d8f',
    type: [Types.ObjectId],
  })
  board: ObjectId[];

  @ApiProperty({
    description: 'post of the user',
    example: '5f9d8f5e9d8f5e9d8f5e9d8f',
    type: [Types.ObjectId],
  })
  post: ObjectId[];

  @ApiProperty({
    description: 'userRelations of the user',
    example: '5f9d8f5e9d8f5e9d8f5e9d8f',
    type: [Types.ObjectId],
  })
  userRelations: ObjectId[];

  @ApiProperty({
    description: 'userType of the user',
    example: 'Person',
    type: String,
  })
  userType: any;

  @ApiProperty({
    description: 'name of the user',
    example: 'Maximiliano',
    type: String,
  })
  name: string;

  @ApiProperty({
    description: 'lastName of the user',
    example: 'Cvetic',
    type: String,
  })
  lastName: string;

  @ApiProperty({
    description: 'Gender of the user',
    example: " 'M' | 'F | 'X' | 'O' ",
    type: String,
  })
  readonly gender: string;

  @ApiProperty({
    description: 'birthDate of the user',
    example: '2024-10-10',
    type: String,
  })
  birthDate: string;

  @ApiProperty({
    description: 'userPreferences of the user',
    example: '5f9d8f5e9d8f5e9d8f5e9d8f',
    type: Types.ObjectId,
  })
  userPreferences: UserPreferencesDto_SWAGGER;
}
