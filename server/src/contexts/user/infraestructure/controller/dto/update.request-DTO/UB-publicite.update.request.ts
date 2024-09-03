import { ApiPropertyOptional } from '@nestjs/swagger';
import { ObjectId, Types } from 'mongoose';

export class UB_publiciteUpdateRequestDto {
  @ApiPropertyOptional({
    description: 'Name of the company',
    example: 'Dutsiland',
    type: String,
  })
  readonly businessName: string;

  @ApiPropertyOptional({
    description: 'Sector ID of the company',
    example: '5f9d8f5e9d8f5e9d8f5e9d8f',
    type: Types.ObjectId,
  })
  readonly sector: ObjectId;

  @ApiPropertyOptional({
    description: 'Country of the company',
    example: 'Argentina',
    type: String,
  })
  readonly countryRegion: string;

  @ApiPropertyOptional({
    description: 'Description of the company',
    example: 'I like to code',
    type: String,
  })
  readonly description: string;
}
