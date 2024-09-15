import { ObjectId } from 'mongoose';

export interface UserPreferenceResponse {
  searchPreference: ObjectId[];
  backgroundColor: string;
  boardColor: string;
}
