import { DescriptionRequest } from './user.request.CREATE';

export interface personalAccountUpdateRequest {
  birthDate?: string;
  gender?: string;
  countryRegion?: string;
  description?: DescriptionRequest;
  dni?: string;
  addressPrivacy?: string;
}
