
import { ObjectId } from 'mongoose';

export abstract class BusinessUpdateRequest_SWAGGER {

  businessName: string;

  sector: ObjectId;

  countryRegion: string;

  description: string;
}
