import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { Inject } from '@nestjs/common';

import {
  Gender,
  UserType,
} from '../../infraestructure/controller/dto/enums.request';
import { UserBusinessDto } from '../../infraestructure/controller/dto/user.business.DTO';
import { UserRepositoryInterface } from '../../domain/repository/user-repository.interface';
import { UserServiceInterface } from '../../domain/service/user.service.interface';
import { UserPersonDto } from '../../infraestructure/controller/dto/user.person.DTO';
import { UserPerson } from '../../domain/entity/userPerson.entity';
import { UserBussiness } from '../../domain/entity/userBussiness.entity';
import { User } from '../../domain/entity/user.entity';
@Injectable()
export class UserService implements UserServiceInterface {
  constructor(
    @Inject('UserRepositoryInterface')
    private readonly userRepository: UserRepositoryInterface,
  ) {}

  async createUser(req: UserPersonDto | UserBusinessDto): Promise<User> {
    try {
      if (req instanceof UserPersonDto) {
        const userPersonal: UserPerson = new UserPerson(
          req.clerkId,
          req.email,
          req.username,
          req.description,
          req.profilePhotoUrl,
          req.countryRegion,
          req.isActive,
          req.contact,
          req.createdTime,
          req.subscriptions ? req.subscriptions : [],
          req.groups ? req.groups : [],
          req.magazines ? req.magazines : [],
          req.board ? req.board : [],
          req.post ? req.post : [],
          req.userRelations ? req.userRelations : [],
          UserType.Personal,
          req.name,
          req.lastName,
          req.gender ? Gender.Hombre : Gender.Hombre,
          req.birthDate,
        );
        return await this.userRepository.save(userPersonal, 0);
      } else if (req instanceof UserBusinessDto) {
        console.log('mal');
        const userBusiness: UserBussiness = new UserBussiness(
          req.clerkId,
          req.email,
          req.username,
          req.description,
          req.profilePhotoUrl,
          req.countryRegion,
          req.isActive,
          req.contact,
          req.createdTime,
          req.subscriptions ? req.subscriptions : [],
          req.groups ? req.groups : [],
          req.magazines ? req.magazines : [],
          req.board ? req.board : [],
          req.post ? req.post : [],
          req.userRelations ? req.userRelations : [],
          UserType.Business,
          req.name,
          req.sector,
        );
        return await this.userRepository.save(userBusiness, 1);
      }
      throw new BadRequestException('Invalid user type');
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }
}
