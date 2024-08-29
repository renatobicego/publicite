import {
  UserBusinessDto,
  UserBusinessResponse,
} from '../../infraestructure/controller/dto/user.business.DTO';
import {
  UserPersonDto,
  UserPersonResponse,
} from '../../infraestructure/controller/dto/user.person.DTO';

export interface UserAdapterInterface {
  createUser(
    req: UserPersonDto | UserBusinessDto,
    type: number,
  ): Promise<UserPersonResponse | UserBusinessResponse>;
}
