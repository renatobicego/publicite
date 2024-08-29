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
    switch (type && req instanceof UserPerson) {
      case 0 && req instanceof UserPersonDto:
        this.logger.log('Person user recived in the adapter');
        try {
          const userP: User = await this.userService.createUser(
            req as UserPersonDto,
          );
          return UserPersonDto.formatDocument(userP as UserPerson);
        } catch (error: any) {
          throw error;
        }

      case 1 && req instanceof UserBusinessDto:
        try {
          this.logger.log('Business user recived in the adapter');
          const userB: User = await this.userService.createUser(
            req as UserBusinessDto,
          );
          if (userB instanceof UserBussiness) {
            return UserBusinessDto.formatDocument(userB);
          } else {
            throw new Error('Returned user is not a UserBusiness');
          }
        } catch (error: any) {
          throw error;
        }
      default:
        this.logger.error('Error in adapter. The user has not been created');
        throw new Error('Invalid user type');
    }
  }
}
