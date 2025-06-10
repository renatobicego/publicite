import { ContactRespose } from './user.contact.response';

export interface UserPersonalInformationResponse {
  birthDate?: string;
  gender?: string;
  countryRegion?: string;
  description?: string;
  contact?: ContactRespose;
  sector?: string;
  businessName?: string;
}
