import { UserBusinessDto } from '../../infraestructure/controller/dto/user.business.DTO';
import { UserPersonDto } from '../../infraestructure/controller/dto/user.person.DTO';
import { User } from '../entity/user.entity';

export interface UserServiceInterface {
  createUser(req: UserBusinessDto | UserPersonDto): Promise<User>;
}
