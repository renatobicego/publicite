import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { UserRepositoryInterface } from '../../domain/repository/user-repository.interface';
import { ClientSession, Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { IUserPerson, UserPersonModel } from '../schemas/userPerson.schema';
import {
  IUserBusiness,
  UserBusinessModel,
} from '../schemas/userBussiness.schema';
import { UserPerson } from '../../domain/entity/userPerson.entity';
import { UserBussiness } from '../../domain/entity/userBussiness.entity';
import { User } from '../../domain/entity/user.entity';
import { UserTransformationInterface } from '../../domain/repository/transformations/user-transformation.interface';
import { MyLoggerService } from 'src/contexts/shared/logger/logger.service';
import { SectorRepositoryInterface } from 'src/contexts/businessSector/domain/repository/sector.repository.interface';

@Injectable()
export class UserRepository
  implements UserRepositoryInterface, UserTransformationInterface
{
  constructor(
    @InjectModel(UserPersonModel.modelName)
    private readonly userPersonModel: Model<IUserPerson>,

    @InjectModel(UserBusinessModel.modelName)
    private readonly userBusinessModel: Model<IUserBusiness>,

    @Inject('SectorRepositoryInterface')
    private readonly sectorRepository: SectorRepositoryInterface,

    private readonly logger: MyLoggerService,
  ) {}

  async save(
    reqUser: UserPerson | UserBussiness,
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
          if (reqUser instanceof UserBussiness) {
            this.logger.warn(
              '--VALIDATING BUSINESS SECTOR ID: ' + reqUser.getSector(),
            );
            await this.sectorRepository.validateSector(reqUser.getSector());
            createdUser = this.formatDocument(reqUser);
            userSaved = await createdUser.save({ session });
            return UserBussiness.formatDocument(userSaved as IUserBusiness);
          }
          throw new BadRequestException('Invalid user instance for type 1');

        default:
          throw new BadRequestException('Invalid user type');
      }
    } catch (error) {
      throw error;
    }
  }

  formatDocument(reqUser: User): IUserPerson | IUserBusiness {
    const baseUserData = this.getBaseUserData(reqUser);

    if (reqUser instanceof UserPerson) {
      return new this.userPersonModel({
        ...baseUserData,
        name: reqUser.getName(),
        lastName: reqUser.getLastName(),
        gender: reqUser.getGender(),
        birthDate: reqUser.getBirthDate(),
      });
    } else if (reqUser instanceof UserBussiness) {
      return new this.userBusinessModel({
        ...baseUserData,
        name: reqUser.getName(),
        sector: reqUser.getSector(),
      });
    } else {
      throw new BadRequestException(
        'Invalid user instance - formatDocument in repository',
      );
    }
  }

  getBaseUserData(reqUser: User) {
    return {
      clerkId: reqUser.getClerkId(),
      email: reqUser.getEmail(),
      username: reqUser.getUsername(),
      description: reqUser.getDescription(),
      profilePhotoUrl: reqUser.getProfilePhotoUrl(),
      countryRegion: reqUser.getCountryRegion(),
      isActive: reqUser.getIsActive(),
      contact: reqUser.getContact(),
      createdTime: reqUser.getCreatedTime(),
      subscriptions: reqUser.getSubscriptions(),
      groups: reqUser.getGroups(),
      magazines: reqUser.getMagazines(),
      board: reqUser.getBoard(),
      post: reqUser.getPost(),
      userRelations: reqUser.getUserRelations(),
      userType: reqUser.getUserType(),
    };
  }
}
