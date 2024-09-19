import {
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { UserRepositoryInterface } from '../../domain/repository/user-repository.interface';
import { ClientSession, Model, ObjectId } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { IUserPerson, UserPersonModel } from '../schemas/userPerson.schema';
import {
  IUserBusiness,
  UserBusinessModel,
} from '../schemas/userBussiness.schema';
import { UP_update, UserPerson } from '../../domain/entity/userPerson.entity';
import { UserBusiness } from '../../domain/entity/userBusiness.entity';
import { User } from '../../domain/entity/user.entity';
import { UserTransformationInterface } from '../../domain/repository/transformations/user-transformation.interface';
import { MyLoggerService } from 'src/contexts/shared/logger/logger.service';
import { SectorRepositoryInterface } from 'src/contexts/businessSector/domain/repository/sector.repository.interface';

import { UP_clerkUpdateRequestDto } from 'src/contexts/webhook/application/clerk/dto/UP-clerk.update.request';
import { IUser, UserModel, UserPreferences } from '../schemas/user.schema';
import { error } from 'console';

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

    @Inject('UserTransformationInterface')
    private readonly userRepositoryMapper: UserTransformationInterface,

    private readonly logger: MyLoggerService,
  ) {}

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
            'userPreferences.boardColor': 1,
          },
        )
        .lean();

      return userPreference
        ? (userPreference.userPreferences as UserPreferences)
        : null;
    } catch (error: any) {
      this.logger.error('An error occurred in repository', error);
      throw error;
    }
  }

  async save(
    reqUser: UserPerson | UserBusiness,
    type: number,
    session?: ClientSession,
  ): Promise<User> {
    try {
      let createdUser;
      let userSaved;

      switch (type) {
        case 0: // Personal User
          if (reqUser instanceof UserPerson) {
            createdUser = this.formatDocument(reqUser);
            userSaved = await createdUser.save({ session });
            const userRsp = UserPerson.formatDocument(userSaved as IUserPerson);
            return userRsp;
          }
          throw new BadRequestException('Invalid user instance for type 0');

        case 1: // Business User
          if (reqUser instanceof UserBusiness) {
            this.logger.warn(
              '--VALIDATING BUSINESS SECTOR ID: ' + reqUser.getSector(),
            );
            await this.sectorRepository.validateSector(reqUser.getSector());
            createdUser = this.formatDocument(reqUser);
            userSaved = await createdUser.save({ session });
            return UserBusiness.formatDocument(userSaved as IUserBusiness);
          }
          throw new BadRequestException('Invalid user instance for type 1');

        default:
          throw new BadRequestException('Invalid user type');
      }
    } catch (error) {
      this.logger.error('Error in save method', error);
      throw error;
    }
  }

  async getUserPersonalInformationByUsername(
    username: string,
  ): Promise<Partial<User>> {
    try {
      const user = await this.user.findOne({ username: username });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      let query = this.user.findOne({ username: username }).populate('contact');

      if (user.userType === 'Business') {
        query = query.populate('sector');
      }

      const populatedUser = await query.lean().exec();

      if (populatedUser?.userType === 'Personal') {
        return UserPerson.formatDocument(populatedUser as IUserPerson);
      } else if (populatedUser?.userType === 'Business') {
        return UserBusiness.formatDocument(populatedUser as IUserBusiness);
      } else {
        throw new InternalServerErrorException('User type not recognized');
      }
    } catch (error) {
      this.logger.error(
        'Error in getUserPersonalInformationByUsername method',
        error,
      );
      throw error;
    }
  }

  async update(
    username: string,
    reqUser: UP_update,
    type: number,
  ): Promise<User> {
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
          return UserPerson.formatDocument(userUpdated as IUserPerson);

        case 1: // Business User
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
          return UserBusiness.formatDocument(userUpdatedB as IUserBusiness);

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
  ): Promise<User> {
    try {
      this.logger.log(
        'Updating clerk attributes in the repository, for the ID: ' + clerkId,
      );
      const userUpdated = await this.user
        .findOneAndUpdate({ clerkId: clerkId }, reqUser, { new: true })
        .lean(); // Aplicar lean() aquí si no necesitas métodos Mongoose

      if (!userUpdated) {
        throw new BadRequestException('User not found');
      }
      if (userUpdated.userType === 'Personal') {
        return UserPerson.formatDocument(userUpdated as IUserPerson);
      } else {
        return UserBusiness.formatDocument(userUpdated as IUserBusiness);
      }
    } catch (error) {
      this.logger.error('Error in updateByClerkId method(Repository)', error);
      throw error;
    }
  }

  async updateUserPreferencesByUsername(
    username: string,
    userPreference: UserPreferences,
  ): Promise<UserPreferences | null> {
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

      return this.userRepositoryMapper.formatDocToUserPreferences(
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

  formatDocument(reqUser: User): IUserPerson | IUserBusiness {
    const baseUserData = this.userRepositoryMapper.getBaseUserData(reqUser);
    this.logger.log('Start process in the repository: formatDocument');
    if (reqUser instanceof UserPerson) {
      return new this.userPersonModel({
        ...baseUserData,
        gender: reqUser.getGender(),
        birthDate: reqUser.getBirthDate(),
      });
    } else if (reqUser instanceof UserBusiness) {
      return new this.userBusinessModel({
        ...baseUserData,
        sector: reqUser.getSector(),
        businessName: reqUser.getBusinessName(),
      });
    } else {
      throw new BadRequestException(
        'Invalid user instance - formatDocument in repository',
      );
    }
  }

  async saveNewPost(
    postId: ObjectId,
    authorId: string,
    options?: { session?: ClientSession },
  ): Promise<any> {
    try {
      this.logger.log(
        'Start process in the repository: ' + UserRepository.name,
      );
      const obj = await this.user.findOneAndUpdate(
        { clerkId: authorId },
        { $addToSet: { post: postId } },
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
}
