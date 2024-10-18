import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { UserRepositoryInterface } from '../../domain/repository/user-repository.interface';
import { ClientSession, Connection, Model, ObjectId } from 'mongoose';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { IUserPerson, UserPersonModel } from '../schemas/userPerson.schema';
import {
  IUserBusiness,
  UserBusinessModel,
} from '../schemas/userBussiness.schema';
import { UserPerson } from '../../domain/entity/userPerson.entity';
import { UserBusiness } from '../../domain/entity/userBusiness.entity';
import { User, UserPreferences } from '../../domain/entity/user.entity';
import { UserRepositoryMapperInterface } from '../../domain/repository/mapper/user.repository.mapper.interface';
import { MyLoggerService } from 'src/contexts/shared/logger/logger.service';
import { SectorRepositoryInterface } from 'src/contexts/businessSector/domain/repository/sector.repository.interface';

import { IUser, UserModel } from '../schemas/user.schema';
import { error } from 'console';
import { UserBusinessUpdateDto } from '../../domain/entity/dto/user.business.update.dto';
import { UserPersonalUpdateDto } from '../../domain/entity/dto/user.personal.update.dto';
import { UserPreferencesEntityDto } from '../../domain/entity/dto/user.preferences.update.dto';
import { UP_clerkUpdateRequestDto } from 'src/contexts/webhook/application/clerk/dto/UP-clerk.update.request';
import { UserClerkUpdateDto } from '../../domain/entity/dto/user.clerk.update.dto';
import { UserFindAllResponse } from '../../application/adapter/dto/HTTP-RESPONSE/user.response.dto';
import { fullNameNormalization } from '../../application/functions/utils';

@Injectable()
export class UserRepository implements UserRepositoryInterface {
  constructor(
    @InjectModel(UserPersonModel.modelName)
    private readonly userPersonModel: Model<IUserPerson>,

    @InjectModel(UserBusinessModel.modelName)
    private readonly userBusinessModel: Model<IUserBusiness>,

    @InjectModel(UserModel.modelName)
    private readonly user: Model<IUser>,

    @Inject('SectorRepositoryInterface')
    private readonly sectorRepository: SectorRepositoryInterface,

    @Inject('UserRepositoryMapperInterface')
    private readonly userRepositoryMapper: UserRepositoryMapperInterface,

    private readonly logger: MyLoggerService,
    @InjectConnection() private readonly connection: Connection,
  ) {}

  async findUserByUsername(username: string): Promise<any> {
    try {
      const session = await this.connection.startSession();
      session.startTransaction();
      const user = await this.user
        .findOne({ username })
        .select(
          '_id profilePhotoUrl username contact lastName name businessName countryRegion userType board description email suscriptions groups magazines userRelations posts',
        )
        .populate([
          { path: 'magazines' },
          { path: 'board' },
          { path: 'groups' },
          {
            path: 'posts',
            select:
              '_id imagesUrls title description price reviews frequencyPrice toPrice petitionType postType',
          },
          {
            path: 'magazines',
            select: '_id name description sections ',
            populate: {
              path: 'sections',
              select: '_id posts',
              populate: { path: 'posts', select: '_id imagesUrls' },
            },
          },
        ])
        .session(session)
        .lean();
      if (!user) {
        await session.abortTransaction();
        session.endSession();
        return null;
      }
      await session.commitTransaction();
      session.endSession();
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

  async getUserPersonalInformationByUsername(
    username: string,
  ): Promise<Partial<User> | null> {
    try {
      const user = await this.user.findOne({ username }).lean().exec();

      if (!user) {
        return null; // Devuelve undefined en lugar de lanzar un error
      }

      const projection =
        user.userType.toLowerCase() === 'business'
          ? 'countryRegion description contact sector businessName'
          : 'birthDate gender countryRegion description contact';

      const populatedUser = await this.user
        .findOne({ username })
        .select(projection)
        .populate([
          { path: 'contact' },
          { path: user.userType.toLowerCase() === 'business' ? 'sector' : '' },
        ])
        .lean();

      return populatedUser as Partial<User>;
    } catch (error) {
      this.logger.error(
        'Error in getUserPersonalInformationByUsername method',
        error,
      );
      throw error;
    }
  }

  async pushNotification(notification: any): Promise<any> {
    const { userToSendId } = notification.backData;
    

    try {
      await this.user
        .findOneAndUpdate(
          { _id: userToSendId },
          { $addToSet: { notifications: notification } },
        )
        .lean();
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
  ): Promise<UserPersonalUpdateDto | UserBusinessUpdateDto> {
    try {
      let entityToDocument;

      switch (type) {
        case 0: // Personal User
          this.logger.log('Search user(Personal) for update');
          entityToDocument =
            this.userRepositoryMapper.formatUpdateDocument(reqUser);
          const userUpdated = await this.userPersonModel
            .findOneAndUpdate({ username: username }, entityToDocument, {
              new: true,
            })
            .lean(); // Aplicar lean() aquí si no necesitas métodos Mongoose

          if (!userUpdated) {
            throw new BadRequestException('User not found');
          }
          return this.userRepositoryMapper.documentToEntityMapped_update(
            userUpdated,
            0,
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
          const userUpdatedB = await this.userBusinessModel
            .findOneAndUpdate({ username: username }, entityToDocument, {
              new: true,
            })
            .lean(); // Aplicar lean() aquí si no necesitas métodos Mongoose

          if (!userUpdatedB) {
            throw new BadRequestException('User not found');
          }
          return this.userRepositoryMapper.documentToEntityMapped_update(
            userUpdatedB,
            1,
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
  ): Promise<UserClerkUpdateDto> {
    try {
      this.logger.log(
        'Updating clerk attributes in the repository, for the ID: ' + clerkId,
      );
      const userUpdated = await this.user
        .findOneAndUpdate({ clerkId: clerkId }, reqUser, { new: true })
        .lean();
      if (!userUpdated) {
        throw new BadRequestException('User not found');
      }
      return this.userRepositoryMapper.documentToEntityMapped_clerkUpdate(
        userUpdated,
      );
    } catch (error) {
      this.logger.error('Error in updateByClerkId method(Repository)', error);
      throw error;
    }
  }

  async updateUserPreferencesByUsername(
    username: string,
    userPreference: UserPreferencesEntityDto,
  ): Promise<UserPreferencesEntityDto | null> {
    try {
      this.logger.log(
        'Start process in the repository: updateUserPreferencesByUsername',
      );
      const userDoc = await this.user
        .findOneAndUpdate(
          { username: username },
          { userPreferences: userPreference },
          { new: true },
        )
        .lean(); // Aplicar lean() aquí si no necesitas métodos Mongoose
      if (!userDoc) {
        throw new BadRequestException('User not found');
      }
      const userPreferences = userDoc.userPreferences;
      return this.userRepositoryMapper.documentToEntityMapped_preferences(
        userPreferences,
      );
    } catch (error: any) {
      this.logger.error(
        'Error in updateUserPreferencesByUsername method',
        error,
      );
      throw error;
    }
  }

  async save(reqUser: User, session?: ClientSession): Promise<User> {
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
        userType: reqUser.getUserType,
        userPreferences: reqUser.getUserPreferences,
      };

      switch (reqUser.getUserType?.toLowerCase()) {
        case 'person':
          finder = fullNameNormalization(reqUser.getName, reqUser.getLastName);
          documentToSave.finder = finder;
          return await this.savePersonalAccount(
            documentToSave,
            reqUser as UserPerson,
            {
              session: session,
            },
          );
        case 'business':
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
  ): Promise<User> {
    const newUser = {
      ...baseObj,
      gender: user.getGender,
      birthDate: user.getBirthDate,
    };
    const userDocument = new this.userPersonModel(newUser);

    const documentSaved = await userDocument.save(options);

    const ret = this.userRepositoryMapper.documentToEntityMapped(documentSaved);
    this.logger.log('Personal account created successfully: ' + ret.getId);
    return ret;
  }

  async saveBusinessAccount(
    baseObj: any,
    user: UserBusiness,
    options?: { session?: ClientSession },
  ): Promise<User> {
    const newUser = {
      ...baseObj,
      sector: user.getSector,
      businessName: user.getBusinessName,
    };
    const userDocument = new this.userBusinessModel(newUser);
    const documentSaved = await userDocument.save(options);

    const ret = this.userRepositoryMapper.documentToEntityMapped(documentSaved);
    this.logger.log('Business account created successfully: ' + ret.getId);
    return ret;
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
        throw error;
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

  async saveBoard(
    boardId: ObjectId,
    userId: ObjectId,
    options?: { session?: ClientSession },
  ): Promise<void> {
    this.logger.log(`Asignando el board al usuario: ${userId}`);
    try {
      const userUpdated = await this.user.findOneAndUpdate(
        { _id: userId },
        { board: boardId },
        options,
      );
      if (!userUpdated) {
        this.logger.error('No se encontro el usuario');
        throw new Error('No se encontro el usuario');
      }
    } catch (error) {
      throw new Error(`Error al actualizar el usuario: ${error.message}`);
    }
  }
}
