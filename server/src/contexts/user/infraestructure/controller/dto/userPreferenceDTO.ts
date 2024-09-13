import { Schema } from 'mongoose';

export interface UserPreferences {
  searchPreference: Schema.Types.ObjectId[];
  backgroundColor: string;
  boardColor: string;
}
