import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';
import { Types, ObjectId } from 'mongoose';

import { UserPreferencesDto_SWAGGER } from './user.preferences.dto.swagger';

export class UserBusinessRequestDto_SWAGGER {
  @ApiProperty({
    description: 'ID of the user in clerk',
    example: '5f9d8f5e9d8f5e9d8f5e9d8f',
    type: String,
  })
  readonly clerkId: string;

  @ApiProperty({
    description: 'Email of the user',
    example: 'maxi@dutsiland.com',
    type: String,
  })
  readonly email: string;

  @ApiProperty({
    description: 'Username of the user',
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
    example: 'Business',
    type: String,
  })
  readonly userType: string;

  @ApiProperty({
    description: 'Sector ID of the company',
    example: '5f9d8f5e9d8f5e9d8f5e9d8f',
    type: String,
  })
  readonly sector: ObjectId;

  @ApiProperty({
    description: 'Name',
    example: 'Maxi',
    type: String,
  })
  readonly name: string;

  @ApiProperty({
    description: 'Last Name',
    example: 'Cvetic',
    type: String,
  })
  readonly lastName: string;

  @ApiProperty({
    description: 'Business Name',
    example: 'Cvetic',
    type: String,
  })
  readonly businessName: string;

  @ApiPropertyOptional({
    description: 'User preferences object',
  })
  readonly userPreferences?: UserPreferencesDto_SWAGGER;
}

export class UserBusinessResponseDto_SWAGGER {
  @ApiProperty({
    description: 'ID of the user in Mongo',
    example: '5f9d8f5e9d8f5e9d8f5e9d8f',
    type: Types.ObjectId,
  })
  readonly _id: ObjectId;

  @ApiProperty({
    description: 'ID of the user in clerk',
    example: '5f9d8f5e9d8f5e9d8f5e9d8f',
    type: String,
  })
  readonly clerkId: string;

  @ApiProperty({
    description: 'Email of the user',
    example: 'maxi@dutsiland.com',
    type: String,
  })
  readonly email: string;

  @ApiProperty({
    description: 'Username of the user',
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

  @ApiPropertyOptional({
    description: 'Ids of the subscriptions schema',
    example: '5f9d8f5e9d8f5e9d8f5e9d8f',
    type: [Types.ObjectId],
  })
  @IsOptional()
  readonly subscriptions?: ObjectId[];

  @ApiPropertyOptional({
    description: 'Ids of the groups schema',
    example: '5f9d8f5e9d8f5e9d8f5e9d8f',
    type: [Types.ObjectId],
  })
  @IsOptional()
  readonly groups?: ObjectId[];

  @ApiPropertyOptional({
    description: 'Ids of the magazines schema',
    example: '5f9d8f5e9d8f5e9d8f5e9d8f',
    type: [Types.ObjectId],
  })
  @IsOptional()
  readonly magazines?: ObjectId[];

  @ApiPropertyOptional({
    description: 'Ids of the board schema',
    example: '5f9d8f5e9d8f5e9d8f5e9d8f',
    type: [Types.ObjectId],
  })
  @IsOptional()
  readonly board?: ObjectId[];

  @ApiPropertyOptional({
    description: 'Ids of the post schema',
    example: '5f9d8f5e9d8f5e9d8f5e9d8f',
    type: [Types.ObjectId],
  })
  @IsOptional()
  readonly post?: ObjectId[];

  @ApiPropertyOptional({
    description: 'Ids of the userRelations schema',
    example: '5f9d8f5e9d8f5e9d8f5e9d8f',
    type: [Types.ObjectId],
  })
  @IsOptional()
  readonly userRelations?: ObjectId[];

  @ApiProperty({
    description: 'Type of the user',
    example: 'Business',
    type: String,
  })
  readonly userType?: string;

  @ApiProperty({
    description: 'Sector ID of the company',
    example: '5f9d8f5e9d8f5e9d8f5e9d8f',
    type: String,
  })
  readonly sector: ObjectId;

  @ApiProperty({
    description: 'Name',
    example: 'Maxi',
    type: String,
  })
  readonly name: string;

  @ApiProperty({
    description: 'Last Name',
    example: 'Cvetic',
    type: String,
  })
  readonly lastName: string;

  @ApiProperty({
    description: 'Business Name',
    example: 'Cvetic',
    type: String,
  })
  readonly businessName: string;

  @ApiPropertyOptional({
    description: 'User preferences object',
  })
  readonly userPreferences: UserPreferencesDto_SWAGGER;
}
