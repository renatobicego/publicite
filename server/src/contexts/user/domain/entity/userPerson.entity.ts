import { ObjectId } from 'mongoose';
import { User, UserPreferences } from './user.entity';
import { IUserPerson } from '../../infraestructure/schemas/userPerson.schema';
import { UserPersonDto } from '../../infraestructure/controller/dto/user.person.DTO';
import { UP_publiciteUpdateRequestDto } from '../../infraestructure/controller/dto/update.request-DTO/UP-publicite.update.request';

enum UserType {
  Personal = 'Personal',
  Business = 'Business',
}

export interface UP_update {
  birthDate?: string;
  gender?: string;
  countryRegion?: string;
  description?: string;
}
export class UserPerson extends User {
  private gender: string;
  private birthDate: string;
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
    gender: string,
    birthDate: string,
    contact?: ObjectId | null | undefined | any,
    createdTime?: string,
    subscriptions?: ObjectId[],
    groups?: ObjectId[],
    magazines?: ObjectId[],
    board?: ObjectId[],
    post?: ObjectId[],
    userRelations?: ObjectId[],
    userType?: UserType,
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
      createdTime ?? '',
      subscriptions ?? [],
      groups ?? [],
      magazines ?? [],
      board ?? [],
      post ?? [],
      userRelations ?? [],
      userType ?? UserType.Personal,
      userPreferences ?? {
        searchPreference: [],
        backgroundColor: '',
        boardColor: '',
      },
    );
    this.gender = gender;
    this.birthDate = birthDate;
    this._id = _id;
  }

  // Método para crear una entidad UserPerson a partir de un documento de la base de datos
  static formatDocument(document: IUserPerson): UserPerson {
    return new UserPerson(
      document.clerkId,
      document.email,
      document.username,
      document.description,
      document.profilePhotoUrl,
      document.countryRegion,
      document.isActive,
      document.name,
      document.lastName,
      document.gender,
      document.birthDate,
      document.contact ?? undefined,
      document.createdTime,
      document.subscriptions,
      document.groups,
      document.magazines,
      document.board,
      document.post,
      document.userRelations,
      UserType.Personal,
      document._id as ObjectId,
      document.userPreferences,
    );
  }

  // Método para crear una entidad UserPerson a partir de un DTO para la creación
  static formatDtoToEntity(
    req: UserPersonDto,
    contactId?: ObjectId,
  ): UserPerson {
    return new UserPerson(
      req.clerkId,
      req.email,
      req.username,
      req.description,
      req.profilePhotoUrl,
      req.countryRegion,
      req.isActive,
      req.name,
      req.lastName,
      req.gender,
      req.birthDate,
      contactId ?? undefined,
      req.createdTime,
      req.subscriptions ?? [],
      req.groups ?? [],
      req.magazines ?? [],
      req.board ?? [],
      req.post ?? [],
      req.userRelations ?? [],
      UserType.Personal,
    );
  }

  static formatUpdateDto(req: UP_publiciteUpdateRequestDto): UP_update {
    const updateObject: Partial<UP_update> = {
      ...(req.birthDate && { birthDate: req.birthDate }),
      ...(req.gender && { gender: req.gender }),
      ...(req.countryRegion && { countryRegion: req.countryRegion }),
      ...(req.description && { description: req.description }),
    };

    return updateObject as UP_update;
  }

  public getId(): ObjectId {
    return this._id as ObjectId;
  }

  public getGender(): string {
    return this.gender;
  }

  public getBirthDate(): string {
    return this.birthDate;
  }
}
