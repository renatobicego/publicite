import { ObjectId } from 'mongoose';
import { UserType } from '../../domain/entity/enum/user.enums';
import { User } from '../../domain/entity/user.entity';
import { UserBusiness } from '../../domain/entity/userBusiness.entity';
import { UserPerson } from '../../domain/entity/userPerson.entity';
import { UserFactoryInterface } from '../../domain/user-factory/user.factory.interface';
import { MyLoggerService } from 'src/contexts/module_shared/logger/logger.service';

export class UserFactory implements UserFactoryInterface {
  private static instance: UserFactory | null = null;
  private readonly logger: MyLoggerService;

  private constructor(logger: MyLoggerService) {
    this.logger = logger;
  }

  public static getInstance(logger: MyLoggerService): UserFactory {
    if (!UserFactory.instance) {
      UserFactory.instance = new UserFactory(logger);
    }
    return UserFactory.instance;
  }

  createUser(userType: UserType, userRequest: any): User {
    const subscriptionFree = [
      '66c49508e80296e90ec637d6' as unknown as ObjectId,
    ];
    const activeRelations = [] as unknown as ObjectId[];
    const userBase = new User(
      userRequest.clerkId,
      userRequest.email,
      userRequest.username,
      userRequest.description,
      userRequest.profilePhotoUrl,
      userRequest.countryRegion,
      userRequest.isActive,
      userRequest.dni,
      userRequest.name,
      userRequest.lastName,
      userType,
      undefined, // contact undefined
      userRequest.createdTime,
      subscriptionFree,
      userRequest.groups,
      userRequest.magazines,
      userRequest.board,
      userRequest.post,
      userRequest.userRelations,
      userRequest.userPreferences,
      userRequest.activeRelations ?? activeRelations,
    );
    switch (userType.toLowerCase()) {
      case UserType.Person: {
        this.logger.log('We are creating a persona account');
        return new UserPerson(
          userBase,
          userRequest.gender,
          userRequest.birthDate,
        );
      }
      case UserType.Business: {
        this.logger.log('We are creating a persona account');
        return new UserBusiness(
          userBase,
          userRequest.sector,
          userRequest.businessName,
        );
      }
      default: {
        throw new Error('Invalid user type');
      }
    }
  }
}
