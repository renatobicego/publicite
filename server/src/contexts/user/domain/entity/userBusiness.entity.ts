import { ObjectId } from 'mongoose';
import { User, UserPreferences, UserType } from './user.entity';
import { IUserBusiness } from '../../infraestructure/schemas/userBussiness.schema';
import { UserBusinessDto } from '../../infraestructure/controller/dto/user.business.DTO';
import { UB_publiciteUpdateRequestDto } from '../../infraestructure/controller/dto/update.request-DTO/UB-publicite.update.request';

export interface UB_update {
  businessName?: string;
  sector?: ObjectId;
  countryRegion?: string;
  description?: string;
}

export class UserBusiness extends User {
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
    contact?: ObjectId,
    createdTime: string = '',
    subscriptions: ObjectId[] = [],
    groups: ObjectId[] = [],
    magazines: ObjectId[] = [],
    board: ObjectId[] = [],
    post: ObjectId[] = [],
    userRelations: ObjectId[] = [],
    userType: UserType = UserType.Business,
    _id?: ObjectId,
    userPreferences?: UserPreferences | null,
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
      userType ?? UserType.Business,
      userPreferences ?? {
        searchPreference: [],
        backgroundColor: '',
        boardColor: '',
      },
    );
    this.sector = sector;
    this.businessName = businessName;
    this._id = _id;
  }

  static formatDocument(document: IUserBusiness): UserBusiness {
    return new UserBusiness(
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
      document.userType ?? UserType.Business,
      document._id as ObjectId,
      document.userPreferences,
    );
  }

  static formatDtoToEntity(dto: UserBusinessDto, contactId?: ObjectId) {
    return new UserBusiness(
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
