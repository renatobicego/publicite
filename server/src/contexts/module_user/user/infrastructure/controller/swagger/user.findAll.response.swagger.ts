import { ApiProperty } from '@nestjs/swagger';
import { ObjectId } from 'mongoose';

export class ContactResponseDto {
  @ApiProperty({
    description: 'ID of the contact',
    example: '5f9d8f5e9d8f5e9d8f5e9d8f',
    type: String,
  })
  _id: ObjectId;

  @ApiProperty({
    description: 'Phone number of the contact',
    example: '+541234567890',
    type: String,
    required: false,
  })
  phone?: string;

  @ApiProperty({
    description: 'Instagram handle of the contact',
    example: 'instagram_handle',
    type: String,
    required: false,
  })
  instagram?: string;

  @ApiProperty({
    description: 'Facebook profile of the contact',
    example: 'facebook_profile',
    type: String,
    required: false,
  })
  facebook?: string;

  @ApiProperty({
    description: 'X account of the contact',
    example: '@x_account',
    type: String,
    required: false,
  })
  x?: string;

  @ApiProperty({
    description: 'Website of the contact',
    example: 'https://example.com',
    type: String,
    required: false,
  })
  website?: string;
}

export class UserResponseDto {
  @ApiProperty({
    description: 'ID of the user in MongoDB',
    example: '5f9d8f5e9d8f5e9d8f5e9d8f',
    type: String,
  })
  _id: ObjectId;

  @ApiProperty({
    description: 'Profile photo URL of the user',
    example: 'https://example.com/photo.jpg',
    type: String,
  })
  profilePhotoUrl: string;

  @ApiProperty({
    description: 'Username of the user',
    example: 'juanperez',
    type: String,
  })
  username: string;

  @ApiProperty({
    description: 'Contact information of the user',
    type: () => ContactResponseDto,
  })
  contact: ContactResponseDto;

  @ApiProperty({
    description: 'Country or region of the user',
    example: 'Argentina',
    type: String,
  })
  countryRegion: string;

  @ApiProperty({
    description: 'Type of user (e.g. Regular, Admin)',
    example: 'Regular',
    type: String,
  })
  userType: string;

  @ApiProperty({
    description: 'Business name of the user',
    example: 'Juans Business',
    type: String,
    required: false,
  })
  businessName?: string;

  @ApiProperty({
    description: 'First name of the user',
    example: 'Juan',
    type: String,
  })
  name: string;

  @ApiProperty({
    description: 'Last name of the user',
    example: 'Pérez',
    type: String,
  })
  lastName: string;
}

export class UserFindAllResponseDto_SWAGGER {
  @ApiProperty({
    description: 'User information',
    type: () => UserResponseDto,
  })
  user: UserResponseDto;

  @ApiProperty({
    description: 'Indicates if there are more users available',
    example: true,
    type: Boolean,
  })
  hasMore?: boolean;
}
