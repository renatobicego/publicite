import { BadRequestException, Injectable } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { ClientSession, Connection, Types, ObjectId } from 'mongoose';

import { UserRepositoryInterface } from '../../domain/repository/user-repository.interface';
import { UserServiceInterface } from '../../domain/service/user.service.interface';
import { User, UserPreferences } from '../../domain/entity/user.entity';
import { MyLoggerService } from 'src/contexts/module_shared/logger/logger.service';
import { ContactServiceInterface } from 'src/contexts/module_user/contact/domain/service/contact.service.interface';
import { ContactRequest } from '../adapter/dto/HTTP-REQUEST/user.request.CREATE';
import { UserPersonalUpdateDto } from '../../domain/entity/dto/user.personal.update.dto';
import { UserBusinessUpdateDto } from '../../domain/entity/dto/user.business.update.dto';
import { UserPreferencesEntityDto } from '../../domain/entity/dto/user.preferences.update.dto';
import { UP_clerkUpdateRequestDto } from 'src/contexts/module_webhook/clerk/application/dto/UP-clerk.update.request';
import { UserFindAllResponse } from '../adapter/dto/HTTP-RESPONSE/user.response.dto';


@Injectable()
export class UserService implements UserServiceInterface {
  constructor(
    @Inject('UserRepositoryInterface')
    private readonly userRepository: UserRepositoryInterface,
    @Inject('ContactServiceInterface')
    private readonly contactService: ContactServiceInterface,
    private readonly logger: MyLoggerService,
    @InjectConnection() private readonly connection: Connection,
  ) { }


  async createUser(req: User, contactDto: any): Promise<User> {
    const session = await this.connection.startSession();
    session.startTransaction();
    let user: User;
    this.logger.log(
      'Creating ACCOUNT -> start process in the service: ' + UserService.name,
    );
    try {
      const contactId = await this.createContact(contactDto, {
        session,
      });
      req.setContact(contactId as unknown as ObjectId);
      switch (req.getUserType?.toLowerCase()) {
        case 'person':
          this.logger.log('We are creating a persona account');
          this.logger.log(
            'Creating PERSONAL ACCOUNT with username: ' + req.getUsername,
          );

          user = await this.userRepository.save(req, session);
          await session.commitTransaction();
          await session.endSession();
          return user;
        case 'business':
          this.logger.log(
            'Creating BUSINESS ACCOUNT with username: ' + req.getUsername,
          );
          user = await this.userRepository.save(req, session);
          await session.commitTransaction();
          await session.endSession();
          return user;
        default:
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
    contactDto: ContactRequest,
    options?: { session?: ClientSession },
  ): Promise<Types.ObjectId> {
    try {
      return await this.contactService.createContact(contactDto, options);
    } catch (error: any) {
      throw error;
    }
  }
  async findAllUsers(
    user: string,
    limit: number,
    page: number,
  ): Promise<UserFindAllResponse> {
    try {
      if (page <= 0) page = 1;
      return await this.userRepository.findAllUsers(user, limit, page);
    } catch (error: any) {
      throw error;
    }
  }

  async findUserByUsername(username: string): Promise<any> {
    try {
      return await this.userRepository.findUserByUsername(username);
    } catch (error: any) {
      throw error;
    }
  }

  async getUserPersonalInformationByUsername(username: string): Promise<any> {
    try {
      const user =
        await this.userRepository.getUserPersonalInformationByUsername(
          username,
        );
      return user;
    } catch (error: any) {
      this.logger.error('An error has occurred in user service: ' + error);
      throw error;
    }
  }

  async getUserPreferencesByUsername(
    username: string,
  ): Promise<UserPreferences | null> {
    try {
      const userPreferences =
        await this.userRepository.getUserPreferencesByUsername(username);
      return userPreferences;
    } catch (error: any) {
      throw error;
    }
  }


  async saveNewPost(
    postId: ObjectId,
    authorId: ObjectId,
    options?: { session?: ClientSession },
  ): Promise<void> {
    try {
      this.logger.log('Creating post in the service: ' + UserService.name);
      return await this.userRepository.saveNewPost(postId, authorId, options);
    } catch (error: any) {
      throw error;
    }
  }


  async pushNotification(notification: Types.ObjectId, userId: string, session?: any): Promise<any> {
    try {
      this.logger.log(
        'Notification received in the service: ' + UserService.name,
      );
      await this.userRepository.pushNotification(notification, userId, session);
    } catch (error: any) {
      throw error;
    }
  }


  async updateUserPreferencesByUsername(
    username: string,
    userPreference: UserPreferencesEntityDto,
  ): Promise<UserPreferencesEntityDto | null> {
    try {
      return await this.userRepository.updateUserPreferencesByUsername(
        username,
        userPreference,
      );
    } catch (error: any) {
      this.logger.error(
        'An error has occurred in user service - updateUserPreferencesByUsername: ' +
        error,
      );
      throw error;
    }
  }

  async updateUser(
    username: string,
    req: UserPersonalUpdateDto | UserBusinessUpdateDto,
    type: number,
  ): Promise<UserPersonalUpdateDto | UserBusinessUpdateDto> {
    // 0 -> Personal Account | 1 -> Business Account
    this.logger.log('Updating user in the service: ' + UserService.name);
    try {
      if (type === 0) {
        return await this.userRepository.update(username, req, type);
      } else if (type === 1) {
        return await this.userRepository.update(username, req, type);
      } else {
        throw new Error('Invalid user type');
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
