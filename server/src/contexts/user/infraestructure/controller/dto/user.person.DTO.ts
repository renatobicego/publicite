import { ObjectId, Types } from 'mongoose';
import { Gender, UserType } from './enums.request';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { UserPerson } from 'src/contexts/user/domain/entity/userPerson.entity';
import { ContactRequestDto } from 'src/contexts/contact/infraestructure/controller/request/contact.request';
import { Contact } from 'src/contexts/contact/domain/entity/contact.entity';
import { UserPreferences } from './userPreferenceDTO';

export interface UserPersonResponse {
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
  gender: string;
  birthDate: string;
  userPreferences: UserPreferences;
}

export class UserPersonDto {
  readonly _id?: ObjectId | string;

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
  readonly contact: ContactRequestDto;

  @ApiProperty({
    description: 'Created time of the user',
    example: '2024-10-10',
    type: String,
  })
  readonly createdTime: string;

  @ApiPropertyOptional({
    description: 'Ids of the subscriptions schema',
    example: ['5f9d8f5e9d8f5e9d8f5e9d8f'],
    type: [Types.ObjectId],
  })
  @IsOptional()
  readonly subscriptions?: ObjectId[];

  @ApiPropertyOptional({
    description: 'Ids of the groups schema',
    example: ['5f9d8f5e9d8f5e9d8f5e9d8f'],
    type: [Types.ObjectId],
  })
  @IsOptional()
  readonly groups?: ObjectId[];

  @ApiPropertyOptional({
    description: 'Ids of the magazines schema',
    example: ['5f9d8f5e9d8f5e9d8f5e9d8f'],
    type: [Types.ObjectId],
  })
  @IsOptional()
  readonly magazines?: ObjectId[];

  @ApiPropertyOptional({
    description: 'Ids of the board schema',
    example: ['5f9d8f5e9d8f5e9d8f5e9d8f'],
    type: [Types.ObjectId],
  })
  @IsOptional()
  readonly board?: ObjectId[];

  @ApiPropertyOptional({
    description: 'Ids of the post schema',
    example: ['5f9d8f5e9d8f5e9d8f5e9d8f'],
    type: [Types.ObjectId],
  })
  @IsOptional()
  readonly post?: ObjectId[];

  @ApiPropertyOptional({
    description: 'Ids of the userRelations schema',
    example: ['5f9d8f5e9d8f5e9d8f5e9d8f'],
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
  @IsEnum(Gender)
  readonly gender: Gender;

  @ApiProperty({
    description: 'Birth date of the user',
    example: '2024-10-10',
    type: String,
  })
  readonly birthDate: string;

  @ApiPropertyOptional({
    description: 'User preferences object',
  })
  readonly userPreferences?: UserPreferences;

  static formatDocument(user: UserPerson): UserPersonResponse {
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
      name: user.getName() as string,
      lastName: user.getLastName() as string,
      gender: user.getGender(),
      birthDate: user.getBirthDate(),
      _id: user.getId(),
      userPreferences: user.getUserPreferences() ?? userPreferencesInit,
    };
  }
}

const userPreferencesInit: UserPreferences = {
  searchPreference: [],
  backgroundColor: '',
  boardColor: '',
};
export interface UserPersonalInformationResponse {
  birthDate?: string;
  gender?: string;
  countryRegion?: string;
  description?: string;
  contact?: Contact;
  sector?: string;
  businessName?: string;
}
