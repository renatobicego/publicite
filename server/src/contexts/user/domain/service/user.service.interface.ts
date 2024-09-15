import { ClientSession, Types } from 'mongoose';
import { ContactRequestDto } from 'src/contexts/contact/infraestructure/controller/request/contact.request';
import { UserBusinessDto } from '../../infraestructure/controller/dto/user.business.DTO';
import {
  UserPersonalInformationResponse,
  UserPersonDto,
} from '../../infraestructure/controller/dto/user.person.DTO';
import { User, UserPreferences } from '../entity/user.entity';
import { UP_publiciteUpdateRequestDto } from '../../infraestructure/controller/dto/update.request-DTO/UP-publicite.update.request';
import { UB_publiciteUpdateRequestDto } from '../../infraestructure/controller/dto/update.request-DTO/UB-publicite.update.request';
import { UP_clerkUpdateRequestDto } from 'src/contexts/webhook/application/clerk/dto/UP-clerk.update.request';
import { UserPreferenceResponse } from '../../application/adapter/dto/userPreferences.response';

export interface UserServiceInterface {
  createUser(req: UserBusinessDto | UserPersonDto, type: number): Promise<User>;
  createContact(
    contactDto: ContactRequestDto,
    options?: { session?: ClientSession },
  ): Promise<Types.ObjectId>;

  getUserPersonalInformationByUsername(
    username: string,
  ): Promise<UserPersonalInformationResponse>;
  updateUser(
    username: string,
    req: UP_publiciteUpdateRequestDto | UB_publiciteUpdateRequestDto,
    type: number,
  ): Promise<any>;

  updateUserByClerkId(req: UP_clerkUpdateRequestDto): Promise<any>;
  updateUserPreferencesByUsername(
    username: string,
    userPreference: UserPreferenceResponse,
  ): Promise<UserPreferences | null>;
}
