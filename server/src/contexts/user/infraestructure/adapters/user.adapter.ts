import { Inject } from '@nestjs/common';
import { UserAdapterInterface } from '../../application/adapter/userAdapter.interface';
import { MyLoggerService } from 'src/contexts/shared/logger/logger.service';
import { UserServiceInterface } from '../../domain/service/user.service.interface';
import {
  UserBusinessDto,
  UserBusinessResponse,
} from '../controller/dto/user.business.DTO';
import {
  UserPersonDto,
  UserPersonResponse,
} from '../controller/dto/user.person.DTO';
import { UserPerson } from '../../domain/entity/userPerson.entity';
import { User } from '../../domain/entity/user.entity';
import { UserBussiness } from '../../domain/entity/userBussiness.entity';
import { error } from 'console';

export class UserAdapter implements UserAdapterInterface {
  constructor(
    private readonly logger: MyLoggerService,
    @Inject('UserServiceInterface')
    private readonly userService: UserServiceInterface,
  ) {}

  async createUser(
    req: UserPersonDto | UserBusinessDto,
    type: number,
  ): Promise<UserPersonResponse | UserBusinessResponse> {
    this.logger.log('Creating user in the adapter');

    // Validar tipo y clase de objeto antes de usar el switch
    if (type === 0 && req instanceof UserPersonDto) {
      this.logger.log('Person user received in the adapter');
      try {
        const userP: User = await this.userService.createUser(
          req as UserPersonDto,
          0,
        );
        return UserPersonDto.formatDocument(userP as UserPerson);
      } catch (error) {
        this.logger.error('Error in adapter. The user has not been created');
        throw error;
      }
    } else if (type === 1 && req instanceof UserBusinessDto) {
      this.logger.log('Business user received in the adapter');
      try {
        const userB: User = await this.userService.createUser(
          req as UserBusinessDto,
          1,
        );
        if (userB instanceof UserBussiness) {
          return UserBusinessDto.formatDocument(userB as UserBussiness);
        } else {
          throw new Error('Returned user is not a UserBusiness');
        }
      } catch (error) {
        throw error;
      }
    } else {
      throw error;
    }
  }
}
