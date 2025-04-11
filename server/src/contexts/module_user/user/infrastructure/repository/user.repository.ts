import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { ClientSession, Connection, Model, Types } from 'mongoose';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';

import { IUserPerson, UserPersonModel } from '../schemas/userPerson.schema';
import {
  IUserBusiness,
  UserBusinessModel,
} from '../schemas/userBussiness.schema';
import { UserRepositoryInterface } from '../../domain/repository/user-repository.interface';
import { UserPerson } from '../../domain/entity/userPerson.entity';
import { UserBusiness } from '../../domain/entity/userBusiness.entity';
import { User, UserPreferences } from '../../domain/entity/user.entity';
import { MyLoggerService } from 'src/contexts/module_shared/logger/logger.service';
import { IUser, UserModel } from '../schemas/user.schema';
import { UserBusinessUpdateDto } from '../../domain/entity/dto/user.business.update.dto';
import { UserPersonalUpdateDto } from '../../domain/entity/dto/user.personal.update.dto';
import { UserPreferencesEntityDto } from '../../domain/entity/dto/user.preferences.update.dto';
import { UP_clerkUpdateRequestDto } from 'src/contexts/module_webhook/clerk/application/dto/UP-clerk.update.request';
import { fullNameNormalization } from '../../application/functions/fullNameNormalization';
import { SectorRepositoryInterface } from 'src/contexts/module_user/businessSector/domain/repository/sector.repository.interface';
import { UserType } from '../../domain/entity/enum/user.enums';
import {
  UserRelationDocument,
  UserRelationModel,
} from '../schemas/user.relation.schema';
import { UserRelation } from '../../domain/entity/userRelation.entity';
import { checkIfanyDataWasModified } from 'src/contexts/module_shared/utils/functions/check.result.functions';
import { EmitterService } from 'src/contexts/module_shared/event-emmiter/emmiter';
import { downgrade_plan_contact_notification } from 'src/contexts/module_shared/event-emmiter/events';
import {
  UserMagazineDocument,
  UserMagazineModel,
} from 'src/contexts/module_magazine/magazine/infrastructure/schemas/magazine.user.schema';
import { RelationExistsException } from 'src/contexts/module_shared/exceptionFilter/relationExists';

@Injectable()
export class UserRepository implements UserRepositoryInterface {
  constructor(
    private readonly logger: MyLoggerService,
    private readonly emmiter: EmitterService,
    @InjectConnection()
    private readonly connection: Connection,

    @InjectModel(UserModel.modelName)
    private readonly userModel: Model<IUser>,

    @InjectModel(UserPersonModel.modelName)
    private readonly userPersonModel: Model<IUserPerson>,

    @InjectModel(UserBusinessModel.modelName)
    private readonly userBusinessModel: Model<IUserBusiness>,

    @InjectModel(UserModel.modelName)
    private readonly user: Model<IUser>,

    @InjectModel(UserRelationModel.modelName)
    private readonly userRelation: Model<UserRelationDocument>,

    @InjectModel(UserMagazineModel.modelName)
    private readonly userMagazineModel: Model<UserMagazineDocument>,

    @Inject('SectorRepositoryInterface')
    private readonly sectorRepository: SectorRepositoryInterface,
  ) {}
  async deleteAccount(id: string): Promise<any> {
    try {
      const session = await this.connection.startSession();

      const mongoId = await session.withTransaction(async () => {
        const _id = await this.userModel
          .findOneAndDelete({ clerkId: id })
          .select('_id')
          .lean()
          .session(session); //await this.userModel.findOneAndDelete({ clerkId: id }, { session }).select('_id').lean();
        await this.userMagazineModel.deleteMany({ user: _id });
        await this.userRelation.deleteMany({
          $or: [{ userA: _id }, { userB: _id }],
        });

        return _id;
      });

      return mongoId;
    } catch (error: any) {
      throw error;
    }
  }

  async findUserByIdByOwnUser(_id: string): Promise<any> {
    try {
      const userPopulate_userRelation =
        '_id userType name lastName businessName profilePhotoUrl username';
      const user = await this.user
        .findOne({ _id })
        .select(
          '_id profilePhotoUrl username contact lastName name businessName countryRegion userType board description email suscriptions groups magazines posts friendRequests userRelations',
        )
        .populate([
          { path: 'board' },
          { path: 'groups' },
          { path: 'contact' },
          { path: 'friendRequests' },
          {
            path: 'userRelations',
            populate: [
              {
                path: 'userA',
                select: userPopulate_userRelation,
              },
              {
                path: 'userB',
                select: userPopulate_userRelation,
              },
            ],
          },
          {
            path: 'posts',
            select:
              '_id imagesUrls title description price reviews frequencyPrice toPrice petitionType postType endDate isActive reviews',
            populate: { path: 'reviews', model: 'PostReview' },
          },
        ])
        .lean();

      if (!user) {
        return null;
      }

      if (user.magazines.length > 0) {
        const populatedMagazines: any = await this.userMagazineModel
          .find({ _id: { $in: user.magazines } })
          .select('_id name description sections')
          .populate({
            path: 'sections',
            select: '_id posts isFatherSection',
            populate: {
              path: 'posts',
              model: 'Post',
              select: '_id imagesUrls isActive',
              match: { isActive: true },
            },
          })
          .lean();

        user.magazines = populatedMagazines as any[];
      }
      return user;
    } catch (error: any) {
      console.log(error);
      throw error;
    }
  }

  async findAllUsers(user: string, limit: number, page: number): Promise<any> {
    try {
      const users = await this.user
        .find({
          $or: [
            { finder: { $regex: user, $options: 'i' } },
            { name: { $regex: user, $options: 'i' } },
            { username: { $regex: user, $options: 'i' } },
          ],
        })
        .limit(limit + 1)
        .skip((page - 1) * limit)
        .select(
          'profilePhotoUrl username contact countryRegion userType businessName lastName name',
        )
        .populate('contact')
        .lean();

      const hasMore = users.length > limit;

      const userResponse = users.slice(0, limit);

      return {
        user: userResponse,
        hasMore: hasMore,
      };
    } catch (error: any) {
      throw error;
    }
  }

  async getUserPreferencesByUsername(
    username: string,
  ): Promise<UserPreferences | null> {
    try {
      this.logger.log('Searching user preferences for the user: ' + username);

      const userPreference = await this.user
        .findOne(
          { username: username },
          {
            'userPreferences.searchPreference': 1,
            'userPreferences.backgroundColor': 1,
          },
        )
        .populate('userPreferences.searchPreference')
        .lean();

      return userPreference
        ? (userPreference.userPreferences as UserPreferences)
        : null;
    } catch (error: any) {
      this.logger.error('An error occurred in repository', error);
      throw error;
    }
  }

  async getUserPersonalInformationByUsername(username: string): Promise<any> {
    try {
      const selectFields =
        'sector businessName birthDate gender countryRegion description contact';
      const populatedUser = await this.user
        .findOne({ username })
        .select(selectFields)
        .populate([
          {
            path: 'contact',
          },
          {
            path: 'sector',
          },
        ])
        .lean();

      if (!populatedUser) return null;

      return populatedUser;
    } catch (error) {
      this.logger.error(
        'Error in getUserPersonalInformationByUsername method',
        error,
      );
      throw error;
    }
  }

  async getRelationsFromUserByUserId(userRequestId: string): Promise<any> {
    try {
      return await this.user
        .findById(userRequestId)
        .select('userRelations')
        .populate('userRelations')
        .lean();
    } catch (error: any) {
      throw error;
    }
  }

  async getPostAndLimitsFromUserByUserId(author: string): Promise<any> {
    try {
      const user = await this.user
        .findById(author)
        .select('posts subscriptions -_id')
        .populate([
          {
            path: 'posts isActive',
            match: { isActive: true },
            select: 'postBehaviourType',
          },
          {
            path: 'subscriptions',
            select: 'subscriptionPlan status',
            match: { status: 'authorized' },
            populate: {
              path: 'subscriptionPlan',
              select: 'postsLibresCount postsAgendaCount',
            },
          },
        ]);
      if (!user) {
        console.error('No se encontró el usuario.');
        return null;
      }
      return user;
    } catch (error: any) {
      throw error;
    }
  }

  async getPostAndContactLimitsFromUserByUserId(author: string): Promise<any> {
    try {
      const user = await this.user
        .findById(author)
        .select('posts subscriptions activeRelations -_id')
        .populate([
          {
            path: 'posts isActive',
            match: { isActive: true },
            select: 'postBehaviourType',
          },
          {
            path: 'subscriptions',
            select: 'subscriptionPlan status',
            match: { status: 'authorized' },
            populate: {
              path: 'subscriptionPlan',
              select: 'postsLibresCount postsAgendaCount maxContacts',
            },
          },
        ]);
      if (!user) {
        console.error('No se encontró el usuario.');
        return null;
      }
      return user;
    } catch (error: any) {
      throw error;
    }
  }

  async getLimitContactsFromUserByUserId(
    userRequestId: string,
    session?: any,
  ): Promise<any> {
    try {
      const user = await this.user
        .findById(userRequestId)
        .select('subscriptions -_id')
        .populate([
          {
            path: 'subscriptions',
            select: 'subscriptionPlan status',
            match: { status: 'authorized' },
            populate: {
              path: 'subscriptionPlan',
              select: 'maxContacts',
            },
          },
        ])
        .session(session);
      if (!user) {
        console.error('No se encontró el usuario.');
        return null;
      }
      return user;
    } catch (error: any) {
      throw error;
    }
  }

  async getActiveRelationsOfUser(
    userRequestId: string,
    session: any,
  ): Promise<any> {
    try {
      const userActiveRelation: any = await this.user
        .findById(userRequestId)
        .select('activeRelations -_id')
        .populate('activeRelations')
        .session(session)
        .lean();
      if (!userActiveRelation) {
        console.error('No se encontró el usuario.');
        return null;
      }
      const { activeRelations } = userActiveRelation;
      return activeRelations ?? [];
    } catch (error: any) {
      throw error;
    }
  }

  async getMongoIdByClerkId(clerk_id: string): Promise<any> {
    try {
      return (
        (await this.user.findOne({ clerkId: clerk_id }).select('_id').lean()) ??
        null
      );
    } catch (error: any) {
      throw error;
    }
  }

  async getProfileUserByExternalUserById(
    _id: string,
    condition: any,
  ): Promise<any> {
    try {
      this.logger.log('Get profile user by external user by id');
      const conditionOfVisibility = condition[0].visibility;

      try {
        const userPopulate_userRelation =
          '_id userType name lastName businessName profilePhotoUrl username';
        const user = await this.user
          .findOne({ _id })
          .select(
            '_id profilePhotoUrl username contact lastName name businessName countryRegion userType board description email suscriptions groups magazines posts friendRequests userRelations',
          )
          .populate([
            {
              path: 'board',
              match: {
                $or: [
                  { visibility: 'public' },
                  { visibility: conditionOfVisibility },
                ],
              },
            },
            { path: 'groups' },
            { path: 'contact' },
            { path: 'friendRequests' },
            {
              path: 'userRelations',
              populate: [
                {
                  path: 'userA',
                  select: userPopulate_userRelation,
                },
                {
                  path: 'userB',
                  select: userPopulate_userRelation,
                },
              ],
            },
            {
              path: 'posts',
              select:
                '_id author visibility imagesUrls title description price reviews frequencyPrice toPrice petitionType postType endDate isActive reviews',
              populate: {
                path: 'reviews',
                model: 'PostReview',
                strictPopulate: false,
              },
              match: {
                $or: [
                  { 'visibility.post': 'public' },
                  { 'visibility.post': conditionOfVisibility },
                ],
                isActive: true,
              },
            },
          ])
          .lean();
        if (!user) {
          return null;
        }

        if (user.magazines.length > 0) {
          const populatedMagazines: any = await this.userMagazineModel
            .find({
              _id: { $in: user.magazines },
              visibility: conditionOfVisibility,
            })
            .select('_id name description sections')
            .populate({
              path: 'sections',
              select: '_id posts isFatherSection',
              populate: {
                path: 'posts',
                model: 'Post',
                select: '_id imagesUrls isActive',
                match: {
                  $or: [
                    { 'visibility.post': 'public' },
                    { 'visibility.post': conditionOfVisibility },
                  ],
                  isActive: true,
                },
              },
            })
            .lean();
          user.magazines = populatedMagazines as any[];
        }

        return user;
      } catch (error: any) {
        console.log(error);
        throw error;
      }
    } catch (error: any) {
      throw error;
    }
  }

  async makeFriendRelationBetweenUsers(
    userRelation: UserRelation,
    session: any,
  ): Promise<string | null> {
    try {
      const userA = userRelation.getUserA;
      const userB = userRelation.getUserB;

      if (!userA || !userB) return null;

      const userRelationExists = await this.userRelation.findOne({
        $or: [
          { userA: userA, userB: userB },
          { userA: userB, userB: userA },
        ],
      });
      if (userRelationExists) {
        throw new RelationExistsException();
      }

      const newUserRelation = new this.userRelation(userRelation);
      const userRelationSaved = (await newUserRelation.save()) as any;
      const userRelationId = userRelationSaved._id.toString();

      const result = await this.user.updateMany(
        {
          _id: { $in: [userA, userB] },
        },
        { $addToSet: { userRelations: userRelationId } },
        { session },
      );
      checkIfanyDataWasModified(result);
      return userRelationId;
    } catch (error: any) {
      throw error;
    }
  }

  async pushNotification(
    notification: any,
    userId: string,
    session: any,
  ): Promise<any> {
    try {
      await this.user
        .updateOne(
          { _id: userId },
          { $addToSet: { notifications: notification } },
        )
        .lean()
        .session(session);
      this.logger.log(
        "notification saved successfully in user's notification array",
      );
    } catch (error: any) {
      throw error;
    }
  }
  async pushNewFriendRequestOrRelationRequestToUser(
    notificationId: Types.ObjectId,
    backData: any,
    session: any,
  ): Promise<any> {
    try {
      const ids = [];
      ids.push(backData.userIdFrom);
      ids.push(backData.userIdTo);
      const result = await this.user
        .updateMany(
          { _id: { $in: ids } },
          { $addToSet: { friendRequests: notificationId } },
        )
        .session(session);
      checkIfanyDataWasModified(result);
      this.logger.log(
        "notification saved successfully in user's notification array",
      );
    } catch (error: any) {
      throw error;
    }
  }

  async pushActiveRelationToUser(
    userRequestId: any,
    userRelationId: any,
    session: any,
  ): Promise<void> {
    try {
      await this.user
        .updateOne(
          { _id: userRequestId },
          { $push: { activeRelations: userRelationId } },
        )
        .session(session);
      this.logger.log(
        "Relation active saved successfully in user's activeRelations array",
      );
    } catch (error: any) {
      throw error;
    }
  }

  async update(
    username: string,
    reqUser: UserPersonalUpdateDto | UserBusinessUpdateDto,
    type: UserType,
  ): Promise<any> {
    try {
      switch (type) {
        case UserType.Person: // Personal User
          this.logger.log('Search user(Personal) for update');
          return await this.userPersonModel.updateOne(
            { username: username },
            reqUser,
          );

        case UserType.Business: // Business User
          const cast = reqUser as UserBusinessUpdateDto;
          if (cast.sector) {
            this.logger.log(
              'Validate sector for business user ID: ' + cast.sector,
            );
            await this.sectorRepository.validateSector(cast.sector);
          }
          this.logger.log('Search user(Business) for update');
          return await this.userBusinessModel.updateOne(
            { username: username },
            reqUser,
          );

        default:
          throw new BadRequestException('Invalid user type');
      }
    } catch (error) {
      this.logger.error('Error in update method', error);
      throw error;
    }
  }

  async updateByClerkId(
    clerkId: string,
    reqUser: UP_clerkUpdateRequestDto,
  ): Promise<any> {
    try {
      this.logger.log(
        'Updating clerk attributes in the repository, for the ID: ' + clerkId,
      );
      return await this.user.updateOne({ clerkId: clerkId }, reqUser);
    } catch (error) {
      this.logger.error('Error in updateByClerkId method(Repository)', error);
      throw error;
    }
  }

  async updateFriendRelationOfUsers(
    userRelationId: string,
    typeOfRelation: string,
    session: any,
  ): Promise<void> {
    try {
      const result = await this.userRelation
        .updateOne(
          { _id: userRelationId },
          { typeRelationA: typeOfRelation, typeRelationB: typeOfRelation },
        )
        .session(session);
      checkIfanyDataWasModified(result);
      this.logger.log('Friend relation updated successfully');
    } catch (error: any) {
      this.logger.error(
        'Error in updateFriendRelationOfUsers repository',
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
      this.logger.log(
        'Start process in the repository: updateUserPreferencesByUsername',
      );
      return await this.user.updateOne(
        { username: username },
        { userPreferences: userPreference },
      );
    } catch (error: any) {
      this.logger.error(
        'Error in updateUserPreferencesByUsername method',
        error,
      );
      throw error;
    }
  }

  async removeFriendRequest(
    previousNotificationId: string,
    backData: {
      userIdFrom: string;
      userIdTo: string;
    },
    session: any,
  ): Promise<any> {
    try {
      await this.user
        .updateMany(
          { _id: { $in: [backData.userIdFrom, backData.userIdTo] } },
          { $pull: { friendRequests: previousNotificationId } },
        )
        .session(session);
    } catch (error: any) {
      throw error;
    }
  }

  async removeFriend(
    relationId: string,
    friendRequestId?: string,
  ): Promise<void> {
    const session = await this.connection.startSession();
    try {
      await session.withTransaction(async () => {
        const deleteRelation = this.userRelation.deleteOne(
          { _id: relationId },
          { session },
        );

        const pullOperation: any = { userRelations: relationId };
        if (friendRequestId) {
          pullOperation.friendRequests = friendRequestId;
        }
        pullOperation.activeRelations = relationId;
        const updateUsers = this.user.updateMany(
          { userRelations: relationId },
          { $pull: pullOperation },
          { session },
        );

        await Promise.all([deleteRelation, updateUsers]);
      });
    } catch (error) {
      console.error('Error removing friend relation:', error);
      throw error;
    } finally {
      session.endSession();
    }
  }

  async removeActiveRelationOfUser(
    userRequestId: string,
    contactsToDelete: any[],
    session?: any,
  ): Promise<any> {
    try {
      await this.user.updateOne(
        { _id: userRequestId },
        {
          $pull: {
            activeRelations: { $in: contactsToDelete },
          },
        },
        { session },
      );
      this.emmiter.emit(downgrade_plan_contact_notification, userRequestId);
      return true;
    } catch (error: any) {
      throw error;
    }
  }

  async save(reqUser: User, session?: ClientSession): Promise<any> {
    try {
      this.logger.log('Saving User in repository');
      let finder = '';

      const documentToSave = {
        clerkId: reqUser.getClerkId,
        email: reqUser.getEmail,
        username: reqUser.getUsername,
        description: reqUser.getDescription,
        profilePhotoUrl: reqUser.getProfilePhotoUrl,
        countryRegion: reqUser.getCountryRegion,
        name: reqUser.getName,
        lastName: reqUser.getLastName,
        finder: '',
        isActive: reqUser.getIsActive,
        contact: reqUser.getContact,
        createdTime: reqUser.getCreatedTime,
        subscriptions: reqUser.getSubscriptions,
        groups: reqUser.getGroups,
        magazines: reqUser.getMagazines,
        board: reqUser.getBoard,
        post: reqUser.getPost,
        userRelations: reqUser.getUserRelations,
        userPreferences: reqUser.getUserPreferences,
        notifications: reqUser.getNotifications,
        friendRequests: reqUser.getFriendRequests,
      };

      switch (reqUser.getUserType?.toLowerCase()) {
        case UserType.Person:
          finder = fullNameNormalization(reqUser.getName, reqUser.getLastName);
          documentToSave.finder = finder;
          return await this.savePersonalAccount(
            documentToSave,
            reqUser as UserPerson,
            {
              session: session,
            },
          );
        case UserType.Business:
          const cast = reqUser as UserBusiness;
          this.logger.warn(
            '--VALIDATING BUSINESS SECTOR ID: ' + cast.getSector,
          );
          await this.sectorRepository.validateSector(cast.getSector);
          finder = fullNameNormalization(
            cast.getName,
            cast.getLastName,
            cast.getBusinessName,
          );
          documentToSave.finder = finder;
          return await this.saveBusinessAccount(
            documentToSave,
            reqUser as UserBusiness,
            {
              session: session,
            },
          );
        default:
          throw new BadRequestException('Invalid user type');
      }
    } catch (error) {
      this.logger.error('Error in save method', error);
      throw error;
    }
  }

  async savePersonalAccount(
    baseObj: any,
    user: UserPerson,
    options?: { session?: ClientSession },
  ): Promise<any> {
    const newUser = {
      ...baseObj,
      userType: 'Person',
      gender: user.getGender,
      birthDate: user.getBirthDate,
    };
    const userDocument = new this.userPersonModel(newUser);

    const documentSaved = await userDocument.save(options);
    this.logger.log(
      'Personal account created successfully: ' + documentSaved._id,
    );

    return documentSaved._id;
  }

  async saveBusinessAccount(
    baseObj: any,
    user: UserBusiness,
    options?: { session?: ClientSession },
  ): Promise<any> {
    const newUser = {
      ...baseObj,
      userType: 'Business',
      sector: user.getSector,
      businessName: user.getBusinessName,
    };
    const userDocument = new this.userBusinessModel(newUser);
    const documentSaved = await userDocument.save(options);
    this.logger.log(
      'Business account created successfully: ' + documentSaved._id,
    );
    return documentSaved._id;
  }

  async saveNewPost(
    postId: string,
    authorId: string,
    options?: { session?: ClientSession },
  ): Promise<any> {
    try {
      this.logger.log(
        'Start process in the repository: ' + UserRepository.name,
      );
      const result = await this.user.updateOne(
        { _id: authorId },
        { $addToSet: { posts: postId } },
        options,
      );
      checkIfanyDataWasModified(result);
    } catch (error: any) {
      this.logger.error(
        'An error was occurred trying to save a new post in user array(catch)',
        error,
      );
      throw error;
    }
  }

  async setSubscriptionToUser(
    external_reference: string,
    sub_id: any,
    session: any,
  ): Promise<void> {
    try {
      const result = await this.user.updateOne(
        { _id: external_reference },
        { $addToSet: { subscriptions: sub_id } },
        { session },
      );

      if (result.modifiedCount === 0) {
        throw new Error(
          `No se encontró un usuario con _id: ${external_reference}`,
        );
      }
      this.logger.log(
        'Suscription added to user successfully: ' + external_reference,
      );
    } catch (error) {
      console.error(
        `Error actualizando suscripción para el usuario ${external_reference}:`,
        error,
      );
      throw error;
    }
  }

  async setNewActiveUserRelations(
    activeRelations: string[],
    userRequestId: string,
  ): Promise<any> {
    try {
      return await this.user.updateOne(
        { _id: userRequestId },
        { $set: { activeRelations: activeRelations } },
        { new: true },
      );
    } catch (error: any) {
      throw error;
    }
  }
}
