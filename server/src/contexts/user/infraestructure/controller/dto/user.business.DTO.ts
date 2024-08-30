import { ObjectId, Types } from 'mongoose';
import { UserType } from './enums.request';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';
import { UserBussiness } from 'src/contexts/user/domain/entity/userBussiness.entity';
import { ContactRequestDto } from 'src/contexts/contact/infraestructure/controller/request/contact.request';

export interface UserBusinessResponse {
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
  userType: UserType;
  name: string;
  sector: string;
}
export class UserBusinessDto {
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
  readonly contact: ContactRequestDto;

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
    example: '1',
    type: String,
  })
  readonly userType: UserType;

  @ApiProperty({
    description: 'Sector ID of the company',
    example: '5f9d8f5e9d8f5e9d8f5e9d8f',
    type: String,
  })
  readonly sector: string;

  @ApiProperty({
    description: 'name of the company',
    example: 'Dutsiland',
    type: String,
  })
  readonly name: string;

  static formatDocument(user: UserBussiness): UserBusinessResponse {
    return {
      clerkId: user.getClerkId(),
      email: user.getEmail(),
      username: user.getUsername(),
      description: user.getDescription(),
      profilePhotoUrl: user.getProfilePhotoUrl(),
      countryRegion: user.getCountryRegion(),
      isActive: user.getIsActive(),
      contact: user.getContact(),
      createdTime: user.getCreatedTime(),
      subscriptions: user.getSubscriptions(),
      groups: user.getGroups(),
      magazines: user.getMagazines(),
      board: user.getBoard(),
      post: user.getPost(),
      userRelations: user.getUserRelations(),
      userType: user.getUserType(),
      sector: user.getSector(),
      name: user.getName(),
      _id: user.getId(),
    };
  }
}
