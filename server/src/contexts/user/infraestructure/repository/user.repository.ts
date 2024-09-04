import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { UserRepositoryInterface } from '../../domain/repository/user-repository.interface';
import { ClientSession, Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { IUserPerson, UserPersonModel } from '../schemas/userPerson.schema';
import {
  IUserBusiness,
  UserBusinessModel,
} from '../schemas/userBussiness.schema';
import { UP_update, UserPerson } from '../../domain/entity/userPerson.entity';
import {
  UB_update,
  UserBussiness,
} from '../../domain/entity/userBussiness.entity';
import { User } from '../../domain/entity/user.entity';
import { UserTransformationInterface } from '../../domain/repository/transformations/user-transformation.interface';
import { MyLoggerService } from 'src/contexts/shared/logger/logger.service';
import { SectorRepositoryInterface } from 'src/contexts/businessSector/domain/repository/sector.repository.interface';
import { Gender } from '../controller/dto/enums.request';
import { UP_clerkUpdateRequestDto } from 'src/contexts/webhook/application/clerk/dto/UP-clerk.update.request';

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
          entityToDocument = this.formatUpdateDocument(reqUser);
          const userUpdated = await this.userPersonModel.findOneAndUpdate(
            { username: username }, // Búsqueda por username
            entityToDocument,
            { new: true },
          );
          if (!userUpdated) {
            throw new BadRequestException('User not found');
          }
          return UserPerson.formatDocument(userUpdated as IUserPerson);

        case 1:
          this.logger.log('Search user(Business) for update');
          entityToDocument = this.formatUpdateDocumentUB(reqUser);
          const userUpdatedB = await this.userBusinessModel.findOneAndUpdate(
            { username: username }, // Búsqueda por username
            entityToDocument,
            { new: true },
          );

          if (!userUpdatedB) {
            throw new BadRequestException('User not found');
          }
          return UserBussiness.formatDocument(userUpdatedB as IUserBusiness);
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
  ): Promise<void> {
    try {
      this.logger.log(
        'Updating clerk atributes in the repository, for the ID: ' + clerkId,
      );
      const personalUser = await this.userPersonModel.findOneAndUpdate(
        { clerkId: clerkId },
        reqUser,
        {
          new: true,
        },
      );
      if (!personalUser) {
        const businessUser = await this.userBusinessModel.findOneAndUpdate(
          { clerkId: clerkId },
          reqUser,
          {
            new: true,
          },
        );
        if (!personalUser && !businessUser) {
          throw new BadRequestException('User not found');
        }
      }
    } catch (error) {
      this.logger.error('Error in updateByClerkId method(Repository)', error);
      throw error;
    }
  }
  //---------------------------FORMATS OPERATIONS ------------------
  formatDocument(reqUser: User): IUserPerson | IUserBusiness {
    const baseUserData = this.getBaseUserData(reqUser);
    this.logger.log('Start process in the repository: formatDocument');
    if (reqUser instanceof UserPerson) {
      return new this.userPersonModel({
        ...baseUserData,
        gender: reqUser.getGender(),
        birthDate: reqUser.getBirthDate(),
      });
    } else if (reqUser instanceof UserBussiness) {
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

  getBaseUserData(reqUser: User) {
    this.logger.log('Start process in the repository: getBaseUserData');
    return {
      clerkId: reqUser.getClerkId(),
      email: reqUser.getEmail(),
      username: reqUser.getUsername(),
      name: reqUser.getName(),
      lastName: reqUser.getLastName(),
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

  formatUpdateDocument(reqUser: UP_update): Partial<IUserPerson> {
    // Define una función auxiliar `mapValue` que se utiliza para mapear los valores de `reqUser`
    const mapValue = (
      key: keyof UP_update, // La clave del objeto `reqUser` que estamos procesando
      transformFn?: (value: any) => any, // Una función opcional para transformar el valor
    ) => {
      // Obtiene el valor del objeto `reqUser` para la clave dada
      const value = reqUser[key];

      // Verifica si el valor no es `undefined` ni `null`
      return value !== undefined && value !== null
        ? transformFn // Si se proporciona `transformFn`, aplícalo al valor
          ? transformFn(value)
          : value // Si no se proporciona `transformFn`, retorna el valor tal como está
        : undefined; // Si el valor es `undefined` o `null`, retorna `undefined`
    };

    // Crea un objeto que representa el documento de actualización
    return {
      birthDate: mapValue('birthDate'), // Mapea el campo `birthDate` usando `mapValue`
      gender: mapValue(
        'gender',
        (
          gender, // Mapea el campo `gender` usando `mapValue` con una función de transformación
        ) =>
          gender === 'M'
            ? Gender.Male // Si el valor es 'M', transforma a `Gender.Male`
            : gender === 'F'
              ? Gender.Female // Si el valor es 'F', transforma a `Gender.Female`
              : Gender.Other, // De lo contrario, asigna `Gender.Other`
      ),
      countryRegion: mapValue('countryRegion'), // Mapea el campo `countryRegion` usando `mapValue`
      description: mapValue('description'), // Mapea el campo `description` usando `mapValue`
    };
  }

  formatUpdateDocumentUB(reqUser: UB_update): Partial<IUserBusiness> {
    const mapValue = (
      key: keyof UB_update,
      transformFn?: (value: any) => any,
    ) => {
      const value = reqUser[key];

      return value !== undefined && value !== null
        ? transformFn
          ? transformFn(value)
          : value
        : undefined;
    };

    return {
      businessName: mapValue('businessName'),
      sector: mapValue('sector'),
      countryRegion: mapValue('countryRegion'),
      description: mapValue('description'),
    };
  }
}
