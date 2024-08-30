import { ObjectId } from 'mongoose';
import { User } from './user.entity';
import { IUserBusiness } from '../../infraestructure/schemas/userBussiness.schema';
import { UserBusinessDto } from '../../infraestructure/controller/dto/user.business.DTO';

/*
Entidad para la cuenta de empresa
*/
enum UserType {
  Personal = 'Personal',
  Business = 'Business',
}

export class UserBussiness extends User {
  private sector: ObjectId;
  private _id?: ObjectId;

  constructor(
    clerkId: string,
    email: string,
    username: string,
    description: string,
    profilePhotoUrl: string,
    countryRegion: string,
    isActive: boolean,
    contact: any,
    createdTime: string,
    subscriptions: any[],
    groups: any[],
    magazines: any[],
    board: any[],
    post: any[],
    userRelations: any[],
    userType: UserType,
    name: string,
    sector: ObjectId,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _id?: ObjectId,
  ) {
    super(
      clerkId,
      email,
      username,
      description,
      profilePhotoUrl,
      countryRegion,
      isActive,
      contact,
      createdTime,
      subscriptions,
      groups,
      magazines,
      board,
      post,
      userRelations,
      UserType.Business,
      name,
    );
    this.sector = sector;
    this._id = this._id as ObjectId;
  }

  static formatDocument(document: IUserBusiness): UserBussiness {
    return new UserBussiness(
      document.clerkId,
      document.email,
      document.username,
      document.description,
      document.profilePhotoUrl,
      document.countryRegion,
      document.isActive,
      document.contact,
      document.createdTime,
      document.subscriptions,
      document.groups,
      document.magazines,
      document.board,
      document.post,
      document.userRelations,
      document.userType,
      document.name,
      document.sector,
      document._id as ObjectId,
    );
  }

  static formatDtoToEntity(dto: UserBusinessDto, contactId: ObjectId) {
    return new UserBussiness(
      dto.clerkId,
      dto.email,
      dto.username,
      dto.description,
      dto.profilePhotoUrl,
      dto.countryRegion,
      dto.isActive,
      contactId,
      dto.createdTime,
      dto.subscriptions ?? [],
      dto.groups ?? [],
      dto.magazines ?? [],
      dto.board ?? [],
      dto.post ?? [],
      dto.userRelations ?? [],
      UserType.Business,
      dto.name,
      dto.sector,
    );
  }
  public getId(): ObjectId {
    return this._id as ObjectId;
  }
  public getSector(): ObjectId {
    return this.sector;
  }
}
