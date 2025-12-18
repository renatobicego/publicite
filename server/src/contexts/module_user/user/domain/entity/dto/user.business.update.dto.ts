import { ObjectId } from 'mongoose';

export interface UserBusinessUpdateDto {
  businessName?: string;
  sector?: ObjectId;
  countryRegion: string;
  description?: string;
  addressPrivacy?: string;
}
