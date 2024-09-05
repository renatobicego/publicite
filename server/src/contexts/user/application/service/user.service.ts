import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { ClientSession, Connection, Types } from 'mongoose';

import { UserBusinessDto } from '../../infraestructure/controller/dto/user.business.DTO';
import { UserRepositoryInterface } from '../../domain/repository/user-repository.interface';
import { UserServiceInterface } from '../../domain/service/user.service.interface';
import {
  UserPersonalInformationResponse,
  UserPersonDto,
} from '../../infraestructure/controller/dto/user.person.DTO';
import { UP_update, UserPerson } from '../../domain/entity/userPerson.entity';
import {
  UB_update,
  UserBussiness,
} from '../../domain/entity/userBussiness.entity';
import { User } from '../../domain/entity/user.entity';
import { MyLoggerService } from 'src/contexts/shared/logger/logger.service';
import { ContactServiceInterface } from 'src/contexts/contact/domain/service/contact.service.interface';
import { ObjectId } from 'mongoose';
import { ContactRequestDto } from 'src/contexts/contact/infraestructure/controller/request/contact.request';
import { UP_publiciteUpdateRequestDto } from '../../infraestructure/controller/dto/update.request-DTO/UP-publicite.update.request';
import { UB_publiciteUpdateRequestDto } from '../../infraestructure/controller/dto/update.request-DTO/UB-publicite.update.request';
import { UP_clerkUpdateRequestDto } from 'src/contexts/webhook/application/clerk/dto/UP-clerk.update.request';

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

  async createUser(
    req: UserPersonDto | UserBusinessDto,
    type: number,
  ): Promise<User> {
    const session = await this.connection.startSession();
    session.startTransaction();
    let user: User;
    this.logger.log(
      'Creating ACCOUNT -> start process in the service: ' + UserService.name,
    );
    try {
      const contactId = await this.createContact(req.contact, {
        session,
      });

      if (req instanceof UserPersonDto && type === 0) {
        // Crear el contacto dentro de la transacción

        this.logger.log(
          'Creating PERSONAL ACCOUNT with username: ' + req.username,
        );
        const userPersonal: UserPerson = UserPerson.formatDtoToEntity(
          req,
          contactId as unknown as ObjectId,
        );
        user = await this.userRepository.save(userPersonal, 0, session);

        await session.commitTransaction();
        await session.endSession();
        return user;
      } else if (req instanceof UserBusinessDto && type === 1) {
        this.logger.log(
          'Creating BUSINESS ACCOUNT with username: ' + req.username,
        );
        const userBusiness: UserBussiness = UserBussiness.formatDtoToEntity(
          req,
          contactId as unknown as ObjectId,
        );
        user = await this.userRepository.save(userBusiness, 1, session);
        await session.commitTransaction();
        await session.endSession();
        return user;
      } else {
        throw new BadRequestException('Invalid user type');
      }
    } catch (error) {
      await session.abortTransaction();
      this.logger.error('Error in service. The user has not been created');
      this.logger.error(error);
      throw error;
    } finally {
      session.endSession();
    }
  }

  async createContact(
    contactDto: ContactRequestDto,
    options?: { session?: ClientSession },
  ): Promise<Types.ObjectId> {
    return await this.contactService.createContact(contactDto, options);
  }
  async getUserPersonalInformationByUsername(
    username: string,
  ): Promise<UserPersonalInformationResponse> {
    let userResponse: UserPersonalInformationResponse;
    try {
      const user =
        await this.userRepository.getUserPersonalInformationByUsername(
          username,
        );
      if (!user) {
        throw new NotFoundException('User not found');
      }

      if (user instanceof UserPerson) {
        userResponse = {
          birthDate: user.getBirthDate(),
          gender: user.getGender(),
          countryRegion: user.getCountryRegion(),
          description: user.getDescription(),
          contact: user.getContact() as any,
        };
        return userResponse;
      } else if (user instanceof UserBussiness) {
        userResponse = {
          countryRegion: user.getCountryRegion(),
          description: user.getDescription(),
          contact: user.getContact() as any,
          sector: user.getSector() as any,
          businessName: user.getBusinessName(),
        };
        return userResponse;
      } else {
        throw new NotFoundException('User not found');
      }
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }
  async updateUser(
    username: string,
    req: UP_publiciteUpdateRequestDto | UB_publiciteUpdateRequestDto,
    type: number,
  ): Promise<User> {
    this.logger.log('Updating user in the service: ' + UserService.name);
    let user: User;
    try {
      if (req instanceof UP_publiciteUpdateRequestDto && type === 0) {
        this.logger.log('Update PERSONAL ACCOUNT with username: ' + username);

        const userPersonal: UP_update = UserPerson.formatUpdateDto(req);
        user = await this.userRepository.update(username, userPersonal, type);

        return user;
      } else if (req instanceof UB_publiciteUpdateRequestDto && type === 1) {
        this.logger.log('Update BUSINESS ACCOUNT with username: ' + username);

        const userPersonal: UB_update = UserBussiness.formatUpdateDto(req);
        user = await this.userRepository.update(username, userPersonal, type);
        return user;
      } else {
        this.logger.error(
          'User type not valid: Action -> UPDATE. error in service',
        );
        throw BadRequestException;
      }
    } catch (error: any) {
      this.logger.error(
        'User has not been updated. error in service: ' + error.message,
      );
      throw error;
    }
  }

  async updateUserByClerkId(req: UP_clerkUpdateRequestDto): Promise<any> {
    const clerkId = req.clerkId;
    try {
      return await this.userRepository.updateByClerkId(clerkId, req);
    } catch (error: any) {
      this.logger.error(
        'An error has occurred in user service - UpdateUserByClerk: ' +
          error.message,
      );
      throw error;
    }
  }
}
