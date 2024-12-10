import { UserFindAllResponse } from '../../../application/adapter/dto/HTTP-RESPONSE/user.response.dto';
import { IUserBusiness } from '../../../infrastructure/schemas/userBussiness.schema';
import { IUserPerson } from '../../../infrastructure/schemas/userPerson.schema';

import { UB_update } from '../../entity/userBusiness.entity';
import { UP_update } from '../../entity/userPerson.entity';

export interface UserRepositoryMapperInterface {

  formatUpdateDocument(reqUser: UP_update): Partial<IUserPerson>;
  formatUpdateDocumentUB(reqUser: UB_update): Partial<IUserBusiness>;

  documentToResponseAllUsers(document: any): UserFindAllResponse['user'][0];
}
