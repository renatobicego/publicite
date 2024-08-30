import { BadRequestException, Injectable } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';

import { UserType } from '../../infraestructure/controller/dto/enums.request';
import { UserBusinessDto } from '../../infraestructure/controller/dto/user.business.DTO';
import { UserRepositoryInterface } from '../../domain/repository/user-repository.interface';
import { UserServiceInterface } from '../../domain/service/user.service.interface';
import { UserPersonDto } from '../../infraestructure/controller/dto/user.person.DTO';
import { UserPerson } from '../../domain/entity/userPerson.entity';
import { UserBussiness } from '../../domain/entity/userBussiness.entity';
import { User } from '../../domain/entity/user.entity';
import { MyLoggerService } from 'src/contexts/shared/logger/logger.service';
import { ContactServiceInterface } from 'src/contexts/contact/domain/service/contact.service.interface';
import { ObjectId } from 'mongoose';

@Injectable()
export class UserService implements UserServiceInterface {
  constructor(
    @Inject('UserRepositoryInterface')
    private readonly userRepository: UserRepositoryInterface,
    @Inject('ContactServiceInterface')
    private readonly contactService: ContactServiceInterface,
    private readonly logger: MyLoggerService,
    @InjectConnection() private readonly connection: Connection,
  ) {}

  async createUser(req: UserPersonDto | UserBusinessDto): Promise<User> {
    const session = await this.connection.startSession();
    session.startTransaction();
    try {
      this.logger.log('Creating user with username: ' + req.username);

      // Crear el contacto dentro de la transacción
      const contactId = await this.contactService.createContact(req.contact, {
        session,
      });

      let user: User;
      if (req instanceof UserPersonDto) {
        const userPersonal: UserPerson = UserPerson.formatDtoToEntity(
          req,
          contactId as unknown as ObjectId,
        );
        user = await this.userRepository.save(userPersonal, 0, session);
        // Confirma la transacción
        await session.commitTransaction();
      } else if (req instanceof UserBusinessDto) {
        this.logger.log('Creating user with username: ' + req.username);
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
        user = await this.userRepository.save(userBusiness, 1, session);
        await session.commitTransaction();
      } else {
        throw new BadRequestException('Invalid user type');
      }

      return user;
    } catch (error) {
      // Revertir la transacción en caso de error
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }
}
