import { UserPreferenceResponse } from 'src/contexts/user/application/adapter/dto/userPreferences.response';
import { UserMapperInterface } from 'src/contexts/user/application/adapter/mapper/user.mapper.interface';

export class UserMapper implements UserMapperInterface {
  formatEntityToResponse(obj: any): UserPreferenceResponse {
    return {
      searchPreference: obj.searchPreference,
      backgroundColor: obj.backgroundColor,
      boardColor: obj.boardColor,
    };
  }
}
