import { ObjectId } from 'mongoose';
import { DescriptionRequest } from './user.request.CREATE';

export interface businessAccountUpdateRequest {
  businessName?: string;
  sector?: ObjectId;
  countryRegion?: string;
  description?: DescriptionRequest;
  dni?: string;
  addressPrivacy?: string;
}
