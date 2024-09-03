import { UP_publiciteUpdateRequestDto } from '../../infraestructure/controller/dto/update.request-DTO/UP-publicite.update.request';
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

  updateUser(
    username: string,
    req: UP_publiciteUpdateRequestDto,
    type: number,
  ): Promise<any>;
}
