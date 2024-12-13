import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { ClientSession, Model, ObjectId, Types } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';

import { IUserPerson, UserPersonModel } from '../schemas/userPerson.schema';
import {
  IUserBusiness,
  UserBusinessModel,
} from '../schemas/userBussiness.schema';
import { UserRepositoryInterface } from '../../domain/repository/user-repository.interface';
import { UserPerson } from '../../domain/entity/userPerson.entity';
import { UserBusiness } from '../../domain/entity/userBusiness.entity';
import { User, UserPreferences } from '../../domain/entity/user.entity';
import { UserRepositoryMapperInterface } from '../../domain/repository/mapper/user.repository.mapper.interface';
import { MyLoggerService } from 'src/contexts/module_shared/logger/logger.service';
import { IUser, UserModel } from '../schemas/user.schema';
import { UserBusinessUpdateDto } from '../../domain/entity/dto/user.business.update.dto';
import { UserPersonalUpdateDto } from '../../domain/entity/dto/user.personal.update.dto';
import { UserPreferencesEntityDto } from '../../domain/entity/dto/user.preferences.update.dto';
import { UP_clerkUpdateRequestDto } from 'src/contexts/module_webhook/clerk/application/dto/UP-clerk.update.request';
import { UserFindAllResponse } from '../../application/adapter/dto/HTTP-RESPONSE/user.response.dto';
import { fullNameNormalization } from '../../application/functions/utils';
import { SectorRepositoryInterface } from 'src/contexts/module_user/businessSector/domain/repository/sector.repository.interface';
import { UserType } from '../../domain/entity/enum/user.enums';
import {
  UserRelationDocument,
  UserRelationModel,
} from '../schemas/user.relation.schema';
import { UserRelation } from '../../domain/entity/userRelation.entity';
import {
  MagazineDocument,
  MagazineModel,
} from 'src/contexts/module_magazine/magazine/infrastructure/schemas/magazine.schema';

@Injectable()
export class UserRepository implements UserRepositoryInterface {
  constructor(
    @InjectModel(UserPersonModel.modelName)
    private readonly userPersonModel: Model<IUserPerson>,

    @InjectModel(UserBusinessModel.modelName)
    private readonly userBusinessModel: Model<IUserBusiness>,

    @InjectModel(UserModel.modelName)
    private readonly user: Model<IUser>,

    @InjectModel(UserRelationModel.modelName)
    private readonly userRelation: Model<UserRelationDocument>,

    @InjectModel(MagazineModel.modelName)
    private readonly magazineModel: Model<MagazineDocument>,

    @Inject('SectorRepositoryInterface')
    private readonly sectorRepository: SectorRepositoryInterface,

    @Inject('UserRepositoryMapperInterface')
    private readonly userRepositoryMapper: UserRepositoryMapperInterface,

    private readonly logger: MyLoggerService,
  ) {}

  async findUserByUsername(username: string): Promise<any> {
    try {
      const user = await this.user
        .findOne({ username })
        .select(
          '_id profilePhotoUrl username contact lastName name businessName countryRegion userType board description email suscriptions groups magazines posts friendRequests userRelations',
        )
        .populate([
          { path: 'magazines', select: '_id' },
          { path: 'board' },
          { path: 'groups' },
          { path: 'contact' },
          { path: 'friendRequests' },
          {
            path: 'userRelations',
            populate: [
              {
                path: 'userA',
                select:
                  '_id userType name lastName businessName profilePhotoUrl username',
              },
              {
                path: 'userB',
                select:
                  '_id userType name lastName businessName profilePhotoUrl username',
              },
            ],
          },
          {
            path: 'posts',
            select:
              '_id imagesUrls title description price reviews frequencyPrice toPrice petitionType postType',
          },
        ])
        .lean();

      if (!user) {
        return null;
      }

      if (user.magazines.length > 0) {
        const populatedMagazines = await this.magazineModel
          .find({ _id: { $in: user.magazines } })
          .select('_id name description sections')
          .populate({
            path: 'sections',
            select: '_id posts',
            populate: { path: 'posts', select: '_id imagesUrls' },
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

  async findAllUsers(
    user: string,
    limit: number,
    page: number,
  ): Promise<UserFindAllResponse> {
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

      const userResponse = users
        .slice(0, limit)
        .map((user) =>
          this.userRepositoryMapper.documentToResponseAllUsers(user),
        );

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
  async makeFriendRelationBetweenUsers(
    userRelation: UserRelation,
    session: any,
  ): Promise<void> {
    try {
      const userA = userRelation.getUserA;
      const userB = userRelation.getUserB;

      if (!userA || !userB) return;

      const newUserRelation = new this.userRelation(userRelation);
      const userRelationSaved = await newUserRelation.save();
      const userRelationId = userRelationSaved._id;

      await this.user.updateMany(
        {
          _id: { $in: [userA, userB] },
        },
        { $addToSet: { userRelations: userRelationId } },
        { session },
      );
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
    userNotificationOwner: string,
    session: any,
  ): Promise<any> {
    try {
      await this.user
        .updateOne(
          { _id: userNotificationOwner },
          { $addToSet: { friendRequests: notificationId } },
        )
        .session(session);
      this.logger.log(
        "notification saved successfully in user's notification array",
      );
    } catch (error: any) {
      throw error;
    }
  }

  async update(
    username: string,
    reqUser: UserPersonalUpdateDto | UserBusinessUpdateDto,
    type: number,
  ): Promise<any> {
    try {
      let entityToDocument;

      switch (type) {
        case 0: // Personal User
          this.logger.log('Search user(Personal) for update');
          entityToDocument =
            this.userRepositoryMapper.formatUpdateDocument(reqUser);

          return await this.userPersonModel.updateOne(
            { username: username },
            entityToDocument,
          );

        case 1: // Business User
          const cast = reqUser as UserBusinessUpdateDto;
          if (cast.getSector) {
            this.logger.log(
              'Validate sector for business user ID: ' + cast.getSector,
            );
            await this.sectorRepository.validateSector(cast.getSector);
          }

          this.logger.log('Search user(Business) for update');

          entityToDocument =
            this.userRepositoryMapper.formatUpdateDocumentUB(reqUser);

          return await this.userBusinessModel.updateOne(
            { username: username },
            entityToDocument,
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
    userNotificationOwner: string,
    session: any,
  ): Promise<any> {
    try {
      await this.user
        .updateOne(
          { _id: userNotificationOwner },
          { $pull: { friendRequests: previousNotificationId } },
        )
        .session(session);
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
        userType: reqUser.getUserType,
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
    postId: ObjectId,
    authorId: ObjectId,
    options?: { session?: ClientSession },
  ): Promise<any> {
    try {
      this.logger.log(
        'Start process in the repository: ' + UserRepository.name,
      );
      const obj = await this.user.findOneAndUpdate(
        { _id: authorId },
        { $addToSet: { posts: postId } },
        options,
      );
      if (!obj) {
        this.logger.error(
          'An error was occurred trying to save a new post in user array',
        );
        throw new Error(
          'An error was occurred trying to save a new post in user array',
        ); // error;
      }
      this.logger.log(
        'The post was successfully saved in the user profile: ' +
          UserRepository.name,
      );

      return obj;
    } catch (error: any) {
      this.logger.error(
        'An error was occurred trying to save a new post in user array(catch)',
        error,
      );
      throw error;
    }
  }
}
