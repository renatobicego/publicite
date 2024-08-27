import { IUserPerson } from 'src/contexts/user/infraestructure/schemas/userPerson.schema';
import { User } from '../../entity/user.entity';
import { IUserBusiness } from 'src/contexts/user/infraestructure/schemas/userBussiness.schema';

export interface UserTransformationInterface {
  formatDocument(user: User): IUserPerson | IUserBusiness;
  getBaseUserData(user: User): any;
}
