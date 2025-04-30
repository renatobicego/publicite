import { ObjectId, Types } from 'mongoose';
import { Sector } from 'src/contexts/module_user/businessSector/domain/entity/sector.entity';

export interface SectorResponse {
  _id: ObjectId;
  label: string;
  description: string;
}

export class SectorResponseDto {

  readonly _id: ObjectId;

  readonly label: string;

  readonly description: string;

  static formatClassToResponse(sector: Sector): SectorResponse {
    return {
      _id: sector.getId(),
      label: sector.getLabel(),
      description: sector.getDescription(),
    };
  }
}
