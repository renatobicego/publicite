import { Injectable } from '@nestjs/common';
import { UserRepositoryInterface } from '../../domain/repository/user-repository.interface';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { IUserPerson, UserPersonModel } from '../schemas/userPerson.schema';
import {
  IUserBusiness,
  UserBusinessModel,
} from '../schemas/userBussiness.schema';
import { UserPerson } from '../../domain/entity/userPerson.entity';
import { UserBussiness } from '../../domain/entity/userBussiness.entity';
import { User } from '../../domain/entity/user.entity';

@Injectable()
export class UserRepository implements UserRepositoryInterface {
  constructor(
    @InjectModel(UserPersonModel.modelName) // Corregido para usar el nombre del modelo
    private readonly userPersonModel: Model<IUserPerson>,

    @InjectModel(UserBusinessModel.modelName) // Corregido para usar el nombre del modelo
    private readonly userBusinessModel: Model<IUserBusiness>,
  ) {}

  async save(reqUser: UserPerson | UserBussiness, type: number): Promise<User> {
    try {
      let createdUser;
      let userSaved;

      switch (type) {
        case 0: // Personal User
          if (reqUser instanceof UserPerson) {
            createdUser = new this.userPersonModel({
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
              name: reqUser.getName(),
              lastName: reqUser.getLastName(),
              gender: reqUser.getGender(),
              birthDate: reqUser.getBirthDate(),
            });
            userSaved = await createdUser.save();
            console.log('devolviendo');
            const userRsp = UserPerson.formatDocument(userSaved);
            console.log(userRsp);
            return userRsp;
          }
          throw new Error('Invalid user instance for type 0');

        case 1: // Business User
          if (reqUser instanceof UserBussiness) {
            createdUser = new this.userBusinessModel(reqUser); // Asegúrate de que reqUser sea válido aquí
            userSaved = await createdUser.save();
            return UserBussiness.formatDocument(userSaved);
          }
          throw new Error('Invalid user instance for type 1');

        default:
          throw new Error('Invalid user type');
      }
    } catch (error) {
      console.log(error.message);

      throw error;
    }
  }
}
