import { ObjectId } from 'mongoose';

export class UserBusinessUpdateDto {
  businessName?: string;
  sector?: ObjectId;
  countryRegion: string;
  description?: string;
  constructor(partial: Partial<UserBusinessUpdateDto> = {}) {
    Object.assign(this, partial);
  }

  get getBusinessName() {
    return this.businessName;
  }

  get getSector() {
    return this.sector;
  }

  get getCountryRegion() {
    return this.countryRegion;
  }

  get getDescription() {
    return this.description;
  }
}
