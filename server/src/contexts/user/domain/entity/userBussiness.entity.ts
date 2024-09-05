import { ObjectId } from 'mongoose';
import { User, UserType } from './user.entity';
import { IUserBusiness } from '../../infraestructure/schemas/userBussiness.schema';
import { UserBusinessDto } from '../../infraestructure/controller/dto/user.business.DTO';
import { UB_publiciteUpdateRequestDto } from '../../infraestructure/controller/dto/update.request-DTO/UB-publicite.update.request';

export interface UB_update {
  businessName?: string;
  sector?: ObjectId;
  countryRegion?: string;
  description?: string;
}

export class UserBussiness extends User {
  private businessName: string;
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
    name: string,
    lastName: string,
    sector: ObjectId,
    businessName: string,
    contact?: ObjectId, // Hacer contact opcional
    createdTime: string = '', // Valor por defecto
    subscriptions: ObjectId[] = [], // Valor por defecto
    groups: ObjectId[] = [], // Valor por defecto
    magazines: ObjectId[] = [], // Valor por defecto
    board: ObjectId[] = [], // Valor por defecto
    post: ObjectId[] = [], // Valor por defecto
    userRelations: ObjectId[] = [], // Valor por defecto
    userType: UserType = UserType.Business, // Valor por defecto
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
      name,
      lastName,
      contact,
      createdTime,
      subscriptions,
      groups,
      magazines,
      board,
      post,
      userRelations,
      userType,
    );
    this.sector = sector;
    this.businessName = businessName;
    this._id = _id;
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
      document.name,
      document.lastName,
      document.sector,
      document.businessName,
      document.contact,
      document.createdTime,
      document.subscriptions ?? [],
      document.groups ?? [],
      document.magazines ?? [],
      document.board ?? [],
      document.post ?? [],
      document.userRelations ?? [],
      document.userType ?? UserType.Business, // Valor por defecto en caso de que falte
      document._id as ObjectId,
    );
  }

  static formatDtoToEntity(dto: UserBusinessDto, contactId?: ObjectId) {
    return new UserBussiness(
      dto.clerkId,
      dto.email,
      dto.username,
      dto.description,
      dto.profilePhotoUrl,
      dto.countryRegion,
      dto.isActive,
      dto.name,
      dto.lastName,
      dto.sector,
      dto.businessName,
      contactId,
      dto.createdTime,
      dto.subscriptions ?? [],
      dto.groups ?? [],
      dto.magazines ?? [],
      dto.board ?? [],
      dto.post ?? [],
      dto.userRelations ?? [],
      UserType.Business,
    );
  }

  static formatUpdateDto(req: UB_publiciteUpdateRequestDto): UB_update {
    const updateObject: Partial<UB_update> = {
      ...(req.businessName && { businessName: req.businessName }),
      ...(req.sector && { sector: req.sector }),
      ...(req.countryRegion && { countryRegion: req.countryRegion }),
      ...(req.description && { description: req.description }),
    };

    return updateObject as UB_update;
  }

  public getId(): ObjectId {
    return this._id as ObjectId;
  }

  public getSector(): ObjectId {
    return this.sector;
  }

  public getBusinessName(): string {
    return this.businessName;
  }
}
