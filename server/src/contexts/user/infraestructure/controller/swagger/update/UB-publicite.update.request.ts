import { ApiPropertyOptional } from '@nestjs/swagger';
import { ObjectId, Types } from 'mongoose';

export abstract class BusinessUpdateRequest_SWAGGER {
  @ApiPropertyOptional({
    description: 'Name of the company',
    example: 'Dutsiland',
    type: String,
  })
  businessName: string;
  @ApiPropertyOptional({
    description: 'Sector ID of the company',
    example: '5f9d8f5e9d8f5e9d8f5e9d8f',
    type: Types.ObjectId,
  })
  sector: ObjectId;
  @ApiPropertyOptional({
    description: 'Country of the company',
    example: 'Argentina',
    type: String,
  })
  countryRegion: string;
  @ApiPropertyOptional({
    description: 'Description of the company',
    example: 'I like to code',
    type: String,
  })
  description: string;
}
