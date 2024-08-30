import { ObjectId } from 'mongoose';
import { User } from './user.entity';
import { IUserPerson } from '../../infraestructure/schemas/userPerson.schema';
import { UserPersonDto } from '../../infraestructure/controller/dto/user.person.DTO';

enum UserType {
  Personal = 'Personal',
  Business = 'Business',
}

export class UserPerson extends User {
  private lastName: string;
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
    contact: ObjectId,
    createdTime: string,
    subscriptions: ObjectId[],
    groups: ObjectId[],
    magazines: ObjectId[],
    board: ObjectId[],
    post: ObjectId[],
    userRelations: ObjectId[],
    userType: UserType.Personal,
    name: string,
    lastName: string,
    gender: string,
    birthDate: string,
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
      (subscriptions = subscriptions ?? []),
      (groups = groups ?? []),
      (magazines = magazines ?? []),
      (board = board ?? []),
      (post = post ?? []),
      (userRelations = userRelations ?? []),
      UserType.Personal,
      name,
    );
    this.lastName = lastName;
    this.gender = gender;
    this.birthDate = birthDate;
    this._id = _id;
  }

  static formatDocument(document: IUserPerson): UserPerson {
    return new UserPerson(
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
      UserType.Personal,
      document.name,
      document.lastName,
      document.gender,
      document.birthDate,
      document._id as ObjectId,
    );
  }

  static formatDtoToEntity(
    req: UserPersonDto,
    contactId: ObjectId,
  ): UserPerson {
    return new UserPerson(
      req.clerkId,
      req.email,
      req.username,
      req.description,
      req.profilePhotoUrl,
      req.countryRegion,
      req.isActive,
      contactId,
      req.createdTime,
      req.subscriptions ? req.subscriptions : [],
      req.groups ? req.groups : [],
      req.magazines ? req.magazines : [],
      req.board ? req.board : [],
      req.post ? req.post : [],
      req.userRelations ? req.userRelations : [],
      UserType.Personal,
      req.name,
      req.lastName,
      req.gender,
      req.birthDate,
    );
  }
  public getLastName(): string {
    return this.lastName;
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
