
import { ObjectId } from 'mongoose';

export class ContactResponseDto {
  _id: ObjectId;

  phone?: string;

  instagram?: string;

  facebook?: string;

  x?: string;

  website?: string;
}

export class UserResponseDto {
  _id: ObjectId;

  profilePhotoUrl: string;

  username: string;

  contact: ContactResponseDto;

  countryRegion: string;

  userType: string;

  businessName?: string;

  name: string;


  lastName: string;
}

export class UserFindAllResponseDto_SWAGGER {

  user: UserResponseDto;


  hasMore?: boolean;
}
