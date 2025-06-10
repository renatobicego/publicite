import { ObjectId } from 'mongoose';

export interface businessAccountUpdateRequest {
  businessName?: string;
  sector?: ObjectId;
  countryRegion?: string;
  description?: string;
  dni?: string;
}
