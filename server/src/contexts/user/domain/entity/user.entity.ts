import { ObjectId } from 'mongoose';

export enum UserType {
  Personal = 'Personal',
  Business = 'Business',
}
export interface UserPreferences {
  searchPreference: ObjectId[];
  backgroundColor: string;
  boardColor: string;
}

export abstract class User {
  private clerkId?: string;
  private email?: string;
  private username?: string;
  private description?: string;
  private profilePhotoUrl?: string;
  private countryRegion?: string;
  private name?: string;
  private lastName?: string;
  private isActive?: boolean;
  private contact?: ObjectId;
  private createdTime?: string;
  private subscriptions?: ObjectId[];
  private groups?: ObjectId[];
  private magazines?: ObjectId[];
  private board?: ObjectId[];
  private post?: ObjectId[];
  private userRelations?: ObjectId[];
  private userType?: UserType;
  private userPreferences?: UserPreferences | null;

  constructor(
    clerkId?: string,
    email?: string,
    username?: string,
    description?: string,
    profilePhotoUrl?: string,
    countryRegion?: string,
    isActive?: boolean,
    name?: string,
    lastName?: string,
    contact?: ObjectId,
    createdTime?: string,
    subscriptions?: ObjectId[],
    groups?: ObjectId[],
    magazines?: ObjectId[],
    board?: ObjectId[],
    post?: ObjectId[],
    userRelations?: ObjectId[],
    userType?: UserType,
    userPreferences?: UserPreferences,
  ) {
    this.clerkId = clerkId;
    this.email = email;
    this.username = username;
    this.description = description;
    this.profilePhotoUrl = profilePhotoUrl;
    this.countryRegion = countryRegion;
    this.isActive = isActive;
    this.name = name;
    this.lastName = lastName;
    this.contact = contact;
    this.createdTime = createdTime;
    this.subscriptions = subscriptions ?? [];
    this.groups = groups ?? [];
    this.magazines = magazines ?? [];
    this.board = board ?? [];
    this.post = post ?? [];
    this.userRelations = userRelations ?? [];
    this.userType = userType ?? UserType.Personal;
    this.userPreferences = userPreferences ?? {
      searchPreference: [],
      backgroundColor: '',
      boardColor: '',
    };
  }

  getClerkId(): string | undefined {
    return this.clerkId;
  }

  getEmail(): string | undefined {
    return this.email;
  }

  getUsername(): string | undefined {
    return this.username;
  }

  getDescription(): string | undefined {
    return this.description;
  }

  getProfilePhotoUrl(): string | undefined {
    return this.profilePhotoUrl;
  }

  getCountryRegion(): string | undefined {
    return this.countryRegion;
  }

  getIsActive(): boolean | undefined {
    return this.isActive;
  }

  getContact(): ObjectId | undefined {
    return this.contact;
  }

  getCreatedTime(): string {
    return this.createdTime ?? '';
  }

  getSubscriptions(): ObjectId[] | undefined {
    return this.subscriptions;
  }

  getGroups(): ObjectId[] | undefined {
    return this.groups;
  }

  getMagazines(): ObjectId[] | undefined {
    return this.magazines;
  }

  getBoard(): ObjectId[] | undefined {
    return this.board;
  }

  getPost(): ObjectId[] | undefined {
    return this.post;
  }

  getUserRelations(): ObjectId[] | undefined {
    return this.userRelations;
  }

  getUserType(): UserType {
    return this.userType ?? UserType.Personal;
  }

  getName(): string | undefined {
    return this.name;
  }

  getLastName(): string | undefined {
    return this.lastName;
  }
  getUserPreferences(): UserPreferences | null | undefined {
    return this.userPreferences;
  }
}
