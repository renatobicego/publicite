import { IUserPerson } from 'src/contexts/user/infraestructure/schemas/userPerson.schema';
import { User, UserPreferences } from '../../entity/user.entity';
import { IUserBusiness } from 'src/contexts/user/infraestructure/schemas/userBussiness.schema';
import { UB_update } from '../../entity/userBusiness.entity';
import { UP_update } from '../../entity/userPerson.entity';

export interface UserTransformationInterface {
  getBaseUserData(user: User): any;
  formatUpdateDocument(reqUser: UP_update): Partial<IUserPerson>;
  formatUpdateDocumentUB(reqUser: UB_update): Partial<IUserBusiness>;
  formatDocToUserPreferences(req: any): UserPreferences | null;
}
