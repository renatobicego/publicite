import { Contact } from 'src/contexts/contact/domain/entity/contact.entity';

export interface UserPersonalInformationResponse {
  birthDate?: string;
  gender?: string;
  countryRegion?: string;
  description?: string;
  contact?: Contact;
  sector?: string;
  businessName?: string;
}
