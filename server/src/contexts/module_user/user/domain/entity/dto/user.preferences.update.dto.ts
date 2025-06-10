import { ObjectId } from 'mongoose';

export interface UserPreferencesEntityDto {
  searchPreference?: ObjectId[];
  backgroundColor?: number | undefined;


}
