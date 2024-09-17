import { ObjectId, Types } from 'mongoose';
import { UserType } from '../../../domain/entity/enum/enums.request';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';
import { UserBusiness } from 'src/contexts/user/domain/entity/userBusiness.entity';
import { ContactRequestDto } from 'src/contexts/contact/infraestructure/controller/request/contact.request';
import { UserPreferences } from './userPreferenceDTO';

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
  lastName: string;
  sector: ObjectId;
  businessName: string;
  userPreferences: UserPreferences;
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
  readonly userType?: UserType;

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
  readonly userPreferences?: UserPreferences;
  static formatDocument(user: UserBusiness): UserBusinessResponse {
    return {
      clerkId: user.getClerkId() as string,
      email: user.getEmail() as string,
      username: user.getUsername() as string,
      description: user.getDescription() as string,
      profilePhotoUrl: user.getProfilePhotoUrl() as string,
      countryRegion: user.getCountryRegion() as string,
      isActive: user.getIsActive() as boolean,
      contact: user.getContact() as ObjectId,
      createdTime: user.getCreatedTime(),
      subscriptions: user.getSubscriptions() as ObjectId[],
      groups: user.getGroups() as ObjectId[],
      magazines: user.getMagazines() as ObjectId[],
      board: user.getBoard() as ObjectId[],
      post: user.getPost() as ObjectId[],
      userRelations: user.getUserRelations() as ObjectId[],
      userType: user.getUserType(),
      sector: user.getSector(),
      name: user.getName() as string,
      lastName: user.getLastName() as string,
      businessName: user.getBusinessName(),
      _id: user.getId(),
      userPreferences: user.getUserPreferences() ?? userPreferencesInit,
    };
  }

  constructor(
    clerkId: string,
    email: string,
    username: string,
    description: string,
    profilePhotoUrl: string,
    countryRegion: string,
    isActive: boolean,
    contact: ContactRequestDto,
    createdTime: string,
    sector: ObjectId,
    name: string,
    lastName: string,
    businessName: string,
  ) {
    this.clerkId = clerkId;
    this.email = email;
    this.username = username;
    this.description = description;
    this.profilePhotoUrl = profilePhotoUrl;
    this.countryRegion = countryRegion;
    this.isActive = isActive;
    this.contact = contact;
    this.createdTime = createdTime;
    this.sector = sector;
    this.name = name;
    this.lastName = lastName;
    this.businessName = businessName;
  }
}

const userPreferencesInit: UserPreferences = {
  searchPreference: [],
  backgroundColor: '',
  boardColor: '',
};

export class UserBusinessUpdateDto {
  @ApiProperty({
    description: 'ID of the user in Database',
    example: '5f9d8f5e9d8f5e9d8f5e9d8f',
    type: String,
  })
  readonly _id: ObjectId;

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
    description: 'Sector ID of the company',
    example: '5f9d8f5e9d8f5e9d8f5e9d8f',
    type: String,
  })
  readonly sector: ObjectId;

  @ApiProperty({
    description: 'name',
    example: 'Maxi',
    type: String,
  })
  readonly name: string;

  @ApiProperty({
    description: 'Lastname',
    example: 'Cvetic',
    type: String,
  })
  readonly lastName: string;

  @ApiProperty({
    description: 'Name of the company',
    example: 'Dutsiland',
    type: String,
  })
  readonly businessName: string;
}
