import { UserFindAllResponse } from '../../../application/adapter/dto/HTTP-RESPONSE/user.response.dto';
import { IUserBusiness } from '../../../infrastructure/schemas/userBussiness.schema';
import { IUserPerson } from '../../../infrastructure/schemas/userPerson.schema';
import { UserBusinessUpdateDto } from '../../entity/dto/user.business.update.dto';
import { UserClerkUpdateDto } from '../../entity/dto/user.clerk.update.dto';
import { UserPersonalUpdateDto } from '../../entity/dto/user.personal.update.dto';
import { UserPreferencesEntityDto } from '../../entity/dto/user.preferences.update.dto';
import { User } from '../../entity/user.entity';
import { UB_update } from '../../entity/userBusiness.entity';
import { UP_update } from '../../entity/userPerson.entity';

export interface UserRepositoryMapperInterface {
  //getBaseUserData(user: User): any;
  formatUpdateDocument(reqUser: UP_update): Partial<IUserPerson>;
  formatUpdateDocumentUB(reqUser: UB_update): Partial<IUserBusiness>;
  documentToEntityMapped_preferences(
    document: any,
  ): UserPreferencesEntityDto | null;
  documentToEntityMapped_clerkUpdate(document: any): UserClerkUpdateDto;

  documentToEntityMapped(document: any): User;
  documentToEntityMapped_update(
    document: any,
    type: number,
  ): UserPersonalUpdateDto | UserBusinessUpdateDto;
  documentToResponseAllUsers(document: any): UserFindAllResponse['user'][0];
}
