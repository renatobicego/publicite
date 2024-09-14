import { ApiProperty } from '@nestjs/swagger';
import { ObjectId, Types } from 'mongoose';

// Esta clase UNICAMENTE sirve como modelo para la documentacion de Swagger
export class UserPreferencesDto {
  @ApiProperty({
    description: 'IDs of Categoryes',
    example: '[5f9d8f5e9d8f5e9d8f5e9d8f,5f9d8f5e9d8f5e9d8f5e9d8f]',
    type: [Types.ObjectId],
  })
  searchPreference: ObjectId[];

  @ApiProperty({
    description: 'Background Color',
    example: '#000000',
    type: String,
  })
  backgroundColor: string;

  @ApiProperty({
    description: 'Board Color',
    example: '#000000',
    type: String,
  })
  boardColor: string;
}
