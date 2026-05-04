import { DescriptionRequest } from '../../../application/adapter/dto/HTTP-REQUEST/user.request.CREATE';

export interface UserPersonalUpdateDto {
  birthDate?: string;
  gender?: string;
  countryRegion?: string;
  description?: DescriptionRequest;
  addressPrivacy?: string;
}
