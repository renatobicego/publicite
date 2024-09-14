import { UserPreferenceResponse } from '../dto/userPreferences.response';

export interface UserMapperInterface {
  formatEntityToResponse(obj: any): UserPreferenceResponse;
}
