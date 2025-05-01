
import { ObjectId } from 'mongoose';

// Esta clase UNICAMENTE sirve como modelo para la documentacion de Swagger
export class UserPreferencesDto_SWAGGER {
  searchPreference: ObjectId[];
  backgroundColor: number;
}
