import { ClientSession, Types } from 'mongoose';
import { ContactRequestDto } from 'src/contexts/contact/infraestructure/controller/request/contact.request';
import { UserBusinessDto } from '../../infraestructure/controller/dto/user.business.DTO';
import { UserPersonDto } from '../../infraestructure/controller/dto/user.person.DTO';
import { User } from '../entity/user.entity';
import { UP_publiciteUpdateRequestDto } from '../../infraestructure/controller/dto/update.request-DTO/UP-publicite.update.request';

export interface UserServiceInterface {
  createUser(req: UserBusinessDto | UserPersonDto, type: number): Promise<User>;
  createContact(
    contactDto: ContactRequestDto,
    options?: { session?: ClientSession },
  ): Promise<Types.ObjectId>;

  updateUser(
    username: string,
    req: UP_publiciteUpdateRequestDto,
    type: number,
  ): Promise<any>;
}
