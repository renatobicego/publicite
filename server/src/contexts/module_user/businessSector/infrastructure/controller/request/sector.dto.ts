import { ApiProperty } from '@nestjs/swagger';
import { ObjectId, Types } from 'mongoose';
import { Sector } from 'src/contexts/module_user/businessSector/domain/entity/sector.entity';

export interface SectorResponse {
  _id: ObjectId;
  label: string;
  description: string;
}

export class SectorResponseDto {
  @ApiProperty({
    description: 'ID of sector',
    example: '5f9d8f5e9d8f5e9d8f5e9d8f',
    type: Types.ObjectId,
  })
  readonly _id: ObjectId;
  @ApiProperty({
    description: 'Label sector',
    example: 'Technology',
    type: String,
  })
  readonly label: string;
  @ApiProperty({
    description: 'Description of sector',
    example: 'This is a sector',
    type: String,
  })
  readonly description: string;

  static formatClassToResponse(sector: Sector): SectorResponse {
    return {
      _id: sector.getId(),
      label: sector.getLabel(),
      description: sector.getDescription(),
    };
  }
}
