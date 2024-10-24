import { IUserPerson } from 'src/contexts/user/infrastructure/schemas/userPerson.schema';
import { User } from '../../entity/user.entity';
import { IUserBusiness } from 'src/contexts/user/infrastructure/schemas/userBussiness.schema';
import { UB_update } from '../../entity/userBusiness.entity';
import { UP_update } from '../../entity/userPerson.entity';
import { UserBusinessUpdateDto } from '../../entity/dto/user.business.update.dto';
import { UserPersonalUpdateDto } from '../../entity/dto/user.personal.update.dto';
import { UserPreferencesEntityDto } from '../../entity/dto/user.preferences.update.dto';
import { UserClerkUpdateDto } from '../../entity/dto/user.clerk.update.dto';
import { UserFindAllResponse } from 'src/contexts/user/application/adapter/dto/HTTP-RESPONSE/user.response.dto';
import { Notification } from 'src/contexts/user/application/adapter/dto/HTTP-RESPONSE/notifications/user.notifications.response';


export interface UserRepositoryMapperInterface {
  //getBaseUserData(user: User): any;
  formatUpdateDocument(reqUser: UP_update): Partial<IUserPerson>;
  formatUpdateDocumentUB(reqUser: UB_update): Partial<IUserBusiness>;
  documentToEntityMapped_preferences(
    document: any,
  ): UserPreferencesEntityDto | null;
  documentToEntityMapped_clerkUpdate(document: any): UserClerkUpdateDto;
  documentNotificationToNotificationResponse(
    document: any,
  ): Notification;
  documentToEntityMapped(document: any): User;
  documentToEntityMapped_update(
    document: any,
    type: number,
  ): UserPersonalUpdateDto | UserBusinessUpdateDto;
  documentToResponseAllUsers(document: any): UserFindAllResponse['user'][0];
}
