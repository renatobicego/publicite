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

interface userWithPostsAndSubscriptions {
  posts: [{
    postBehaviourType: string // libre o agenda
  }]
  subscriptions: [
    {
      subscriptionPlan: {
        postsLibresCount: number
        postsAgendaCount: number
      }
    }
  ]
}

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
      return await this.userRepository.makeFriendRelationBetweenUsers(
        userRelation,
        session,
      );
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
      const { totalAgendaPostLimit, totalLibrePostLimit } = userWithSubscriptionsAndPosts.subscriptions.reduce(
        (limits, subscription) => {
          limits.totalAgendaPostLimit += subscription.subscriptionPlan.postsAgendaCount;
          limits.totalLibrePostLimit += subscription.subscriptionPlan.postsLibresCount;
          return limits;
        },
        { totalAgendaPostLimit: 0, totalLibrePostLimit: 0 }
      );


      const { agendaPostCount, librePostCount } = userWithSubscriptionsAndPosts.posts.reduce(
        (counts, post) => {
          if (post.postBehaviourType === 'agenda') counts.agendaPostCount++;
          if (post.postBehaviourType === 'libre') counts.librePostCount++;
          return counts;
        },
        { agendaPostCount: 0, librePostCount: 0 }
      );
      this.logger.warn("STATUS ACTUAL, ANTES DE ACTUALIZAR")
      this.logger.log("User has agenda post: " + agendaPostCount + " |--|  User has Libre post: " + librePostCount);
      this.logger.log("Total agenda limit of user plan: " + totalAgendaPostLimit + " - Total libre limit of user plan : " + totalLibrePostLimit);

      const agendaAvailable = totalAgendaPostLimit - agendaPostCount;
      const libreAvailable = totalLibrePostLimit - librePostCount;
      this.logger.log('Agenda available of user: ' + agendaAvailable);
      this.logger.log('Libre available of user: ' + libreAvailable);
      this.logger.warn("PROCEDIENDO A ACTUALIZAR STATUS DE POSTS ")
      return { agendaPostCount, librePostCount, totalAgendaPostLimit, totalLibrePostLimit, agendaAvailable, libreAvailable };
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
