import { Contact } from './user.contact.response';

export interface UserPersonalInformationResponse {
  birthDate?: string;
  gender?: string;
  countryRegion?: string;
  description?: string;
  contact?: Contact;
  sector?: string;
  businessName?: string;
}
