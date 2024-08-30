import { ClientSession, Types } from 'mongoose';
import { ContactRequestDto } from 'src/contexts/contact/infraestructure/controller/request/contact.request';
import { UserBusinessDto } from '../../infraestructure/controller/dto/user.business.DTO';
import { UserPersonDto } from '../../infraestructure/controller/dto/user.person.DTO';
import { User } from '../entity/user.entity';

export interface UserServiceInterface {
  createUser(req: UserBusinessDto | UserPersonDto): Promise<User>;
  createContact(
    contactDto: ContactRequestDto,
    options?: { session?: ClientSession },
  ): Promise<Types.ObjectId>;
}
