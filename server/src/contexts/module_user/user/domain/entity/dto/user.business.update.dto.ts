import { ObjectId } from 'mongoose';
import { DescriptionRequest } from '../../../application/adapter/dto/HTTP-REQUEST/user.request.CREATE';

export interface UserBusinessUpdateDto {
  businessName?: string;
  sector?: ObjectId;
  countryRegion: string;
  description?: DescriptionRequest;
  addressPrivacy?: string;
}
