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
import { UserType } from '../../domain/entity/enum/user.enums';
import { UserRelation } from '../../domain/entity/userRelation.entity';
import { calculateContactLimitFromUser, calculatePostLimitFromUser, userWithPostsAndSubscriptions } from '../functions/calculatePostLimitAndContactLimit';
import { ommitUndefinedValues } from './ommit-function';


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





  async makeFriendRelationBetweenUsers(
    backData: { userIdFrom: string; userIdTo: string },
    typeOfRelation: string,
    session: any,
  ): Promise<string | null> {
    try {
      const userRelation = new UserRelation(
        backData.userIdFrom,
        backData.userIdTo,
        typeOfRelation,
        typeOfRelation,
      );
      const userRelationId = await this.userRepository.makeFriendRelationBetweenUsers(
        userRelation,
        session,
      );

      const maxRelation = await this.getLimitContactsFromUserByUserId(backData.userIdTo, session)

      const activeRelationOfUser = await this.userRepository.getActiveRelationsOfUser(
        backData.userIdTo,
        session
      )


      if (activeRelationOfUser && (activeRelationOfUser.length < maxRelation)) {
        await this.userRepository.pushActiveRelationToUser(backData.userIdTo, userRelationId, session)
      }

      return userRelationId;
    } catch (error: any) {
      throw error;
    }
  }

  async createUser(userEntity: User, contactDto: any): Promise<string> {
    this.logger.log(
      'Creating ACCOUNT -> start process in the service: ' + UserService.name,
    );
    let userId: string;
    const session = await this.connection.startSession();

    try {
      userId = await session.withTransaction(async () => {
        const contactId = await this.createContact(contactDto, session);
        userEntity.setContact(contactId as unknown as ObjectId);

        switch (userEntity.getUserType?.toLowerCase()) {
          case UserType.Person:
            this.logger.log(
              'Creating PERSONAL ACCOUNT with username: ' +
              userEntity.getUsername,
            );


            return await this.userRepository.save(userEntity, session);

          case UserType.Business:
            this.logger.log(
              'Creating BUSINESS ACCOUNT with username: ' +
              userEntity.getUsername,
            );

            return await this.userRepository.save(userEntity, session);

          default:
            throw new BadRequestException('Invalid user type');
        }
      });

      return userId;
    } catch (error) {
      if (session.inTransaction()) {
        await session.abortTransaction();
      }

      this.logger.error('Error in service. The user has not been created');
      this.logger.error(error);
      throw error;
    } finally {
      session.endSession();
    }
  }

  async createContact(
    contactDto: ContactRequest,
    session: any,
  ): Promise<Types.ObjectId> {
    try {
      return await this.contactService.createContact(contactDto, session);
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

  async findUserByUsername(
    username: string,
    userRequestId?: string,
  ): Promise<any> {
    try {
      const user = await this.userRepository.findUserByUsername(username);

      if (user) {
        user.isFriendRequestPending = false;

        if (user.friendRequests && user.friendRequests.length > 0) {
          user.friendRequests.map((friend_Request: any) => {
            if (friend_Request.backData.userIdFrom === userRequestId) {
              user.isFriendRequestPending = true;
            }
          });
        }
      } else {
        return null;
      }

      return user;
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

  async getRelationsFromUserByUserId(userRequestId: string): Promise<any> {
    try {
      this.logger.log('finding relations from user with id: ' + userRequestId);
      const userRelationDocument =
        await this.userRepository.getRelationsFromUserByUserId(userRequestId);
      const { userRelations } = userRelationDocument;
      return userRelations;
    } catch (error: any) {
      throw error;
    }
  }



  async getPostAndLimitsFromUserByUserId(author: string): Promise<any> {
    try {
      const userWithSubscriptionsAndPosts: userWithPostsAndSubscriptions =
        await this.userRepository.getPostAndLimitsFromUserByUserId(author);
      if (!userWithSubscriptionsAndPosts) {
        this.logger.log('User not found');
        return false;
      }

      return calculatePostLimitFromUser(userWithSubscriptionsAndPosts, this.logger);
    } catch (error: any) {
      throw error;
    }
  }



  async getPostAndContactLimit(author: string): Promise<{ agendaPostCount: number; librePostCount: number; totalAgendaPostLimit: number; totalLibrePostLimit: number; agendaAvailable: number; libreAvailable: number; contactLimit: number; contactCount: number; contactAvailable: number; }> {
    try {
      const userWithSubscriptionsAndPosts: userWithPostsAndSubscriptions = await this.userRepository.getPostAndContactLimitsFromUserByUserId(author);
      const { agendaPostCount, librePostCount, totalAgendaPostLimit, totalLibrePostLimit, agendaAvailable, libreAvailable } = calculatePostLimitFromUser(userWithSubscriptionsAndPosts, this.logger)
      const { contactLimit, contactCount, contactAvailable } = calculateContactLimitFromUser(userWithSubscriptionsAndPosts, this.logger)

      return {
        agendaPostCount,
        librePostCount,
        totalAgendaPostLimit,
        totalLibrePostLimit,
        agendaAvailable,
        libreAvailable,
        contactLimit,
        contactCount,
        contactAvailable
      }
    } catch (error: any) {
      throw error;
    }
  }





  async getLimitContactsFromUserByUserId(userRequestId: string, session?: any): Promise<any> {
    try {

      this.logger.log('finding relations from user with id: ' + userRequestId);
      let maxContacts = 0;
      const userSubscriptionPlans = await this.userRepository.getLimitContactsFromUserByUserId(userRequestId, session);

      if (!userSubscriptionPlans || userSubscriptionPlans.length === 0) return maxContacts;

      const { subscriptions } = userSubscriptionPlans
      subscriptions.map((plan: any) => {
        return maxContacts += plan.subscriptionPlan.maxContacts
      })


      return maxContacts


    } catch (error: any) {
      throw error;
    }

  }

  async getActiveRelationOfUser(userRequestId: string, session?: any): Promise<any> {
    try {
      return await this.userRepository.getActiveRelationsOfUser(userRequestId)
    } catch (error: any) {
      throw error;
    }
  }

  async getMongoIdByClerkId(clerk_id: string): Promise<void> {
    try {
      return await this.userRepository.getMongoIdByClerkId(clerk_id);
    } catch (error: any) {
      throw error;
    }
  }





  async isThisUserAllowedToPost(authorId: string, postBehaviourType: string): Promise<boolean> {
    try {


      const { agendaPostCount, librePostCount, totalAgendaPostLimit, totalLibrePostLimit } = await this.getPostAndLimitsFromUserByUserId(authorId);

      switch (postBehaviourType) {
        case 'agenda':
          if (agendaPostCount >= totalAgendaPostLimit) {
            this.logger.warn('Agenda post limit reached');
            return false;
          }
          return true;
        case 'libre':
          if (librePostCount >= totalLibrePostLimit) {
            this.logger.warn('Libre post limit reached');
            return false;
          }
          return true;
        default:
          this.logger.warn('Invalid post type specified');
          return false;
      }
    } catch (error: any) {
      this.logger.error('Error while verifying user posting permissions', error);
      throw error;
    }
  }




  async pushNotificationToUserArrayNotifications(
    notification: Types.ObjectId,
    userId: string,
    userIdFrom: string,
    session?: any,
  ): Promise<any> {
    try {
      this.logger.log(
        'Notification received in the service: ' + UserService.name,
      );
      if (userId === userIdFrom) {
        this.logger.log('User id and user id from are the same');
        return
      }
      await this.userRepository.pushNotification(notification, userId, session);
    } catch (error: any) {
      throw error;
    }
  }
  async pushNewFriendRequestOrRelationRequestToUser(
    notificationId: Types.ObjectId,
    userNotificationOwner: string,
    session: any,
  ): Promise<any> {
    try {
      this.logger.log(
        'Notification received in the service: ' + UserService.name,
      );

      await this.userRepository.pushNewFriendRequestOrRelationRequestToUser(
        notificationId,
        userNotificationOwner,
        session,
      );
    } catch (error: any) {
      throw error;
    }
  }

  async removeFriendRequest(
    previousNotificationId: string,
    userNotificationOwner: string,
    session: any,
  ) {
    try {
      await this.userRepository.removeFriendRequest(
        previousNotificationId,
        userNotificationOwner,
        session,
      );
    } catch (error: any) {
      throw error;
    }
  }
  async removeFriend(
    relationId: string,
    friendRequestId?: string,
  ): Promise<any> {
    try {
      return await this.userRepository.removeFriend(
        relationId,
        friendRequestId,
      );
    } catch (error: any) {
      throw error;
    }
  }



  async removeActiveRelationOfUser(userId: string, session?: any): Promise<any> {
    try {
      const limitContact: number = await this.getLimitContactsFromUserByUserId(userId)
      let activeRelations: [] = await this.getActiveRelationOfUser(userId)
      let contactExceded: number = 0;
      const activeRelationsLenght: number = activeRelations.length ?? 0;

      if (limitContact < activeRelationsLenght) {
        contactExceded = activeRelationsLenght - limitContact;
        this.logger.warn("Limite de contactos: " + limitContact + " Contactos actuales: " + activeRelationsLenght + " Contactos a eliminar: " + contactExceded)
        const contactsToDelete: any[] = activeRelations.slice(limitContact, (limitContact + contactExceded));
        return await this.userRepository.removeActiveRelationOfUser(userId, contactsToDelete, session);

      } else {
        this.logger.warn("Limite de contactos: " + limitContact + " Contactos actuales: " + activeRelationsLenght + " Contactos a eliminar: " + contactExceded)
        return true
      }
    } catch (error: any) {
      throw error;
    }
  }


  async saveNewPostInUser(
    postId: string,
    authorId: string,
    options?: { session?: ClientSession },
  ): Promise<any> {
    try {
      this.logger.log('Creating post in the service: ' + UserService.name);
      return await this.userRepository.saveNewPost(postId, authorId, options);
    } catch (error: any) {
      throw error;
    }
  }
  async setSubscriptionToUser(external_reference: string, sub_id: any, session: any): Promise<any> {
    try {
      await this.userRepository.setSubscriptionToUser(external_reference, sub_id, session);
    } catch (error: any) {
      throw error;
    }

  }


  async setNewActiveUserRelations(activeRelations: string[], userRequestId: string): Promise<any> {
    try {

      if (activeRelations.length <= 0) return null
      const newActiveRelationLength = activeRelations.length
      const limitAvailableOfUser: number = await this.getLimitContactsFromUserByUserId(userRequestId)

      if (newActiveRelationLength > limitAvailableOfUser) {
        throw new BadRequestException("El usuario no puede tener mas de " + limitAvailableOfUser + " contactos activos")
      }

      return await this.userRepository.setNewActiveUserRelations(activeRelations, userRequestId);
    } catch (error: any) {
      throw error;
    }
  }


  async updateFriendRelationOfUsers(
    userRelationId: string,
    typeOfRelation: string,
    session: any,
  ): Promise<void> {
    try {
      this.logger.log(
        'Updating friend relation in the service: ' + UserService.name,
      );

      await this.userRepository.updateFriendRelationOfUsers(
        userRelationId,
        typeOfRelation,
        session,
      );
    } catch (error: any) {
      this.logger.error(
        'An error has occurred in user service - updateFriendRelationOfUsers: ' +
        error,
      );
      throw error;
    }
  }

  async updateUserPreferencesByUsername(
    username: string,
    userPreference: UserPreferencesEntityDto,
  ): Promise<any> {
    try {
      const updated = ommitUndefinedValues(userPreference);
      return await this.userRepository.updateUserPreferencesByUsername(
        username,
        updated as UserPreferencesEntityDto,
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
    type: UserType,
  ): Promise<UserPersonalUpdateDto | UserBusinessUpdateDto> {

    this.logger.log('Updating user in the service: ' + UserService.name);
    try {
      const updated = ommitUndefinedValues(req);
      if (type === UserType.Person) {
        return await this.userRepository.update(username, updated, type);

      } else if (type === UserType.Business) {
        return await this.userRepository.update(username, updated, type);
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
