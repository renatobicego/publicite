import { ObjectId } from 'mongoose';

export interface UserBusinessUpdateResponse {
  businessName?: string;
  sector?: ObjectId;
  countryRegion?: string;
  description?: string;
}
