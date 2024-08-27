import { ObjectId } from 'mongoose';

enum UserType {
  Personal = 'Personal',
  Business = 'Business',
}

export abstract class User {
  private clerkId: string;
  private email: string;
  private username: string;
  private description: string;
  private profilePhotoUrl: string;
  private countryRegion: string;
  private isActive: boolean;
  private contact: ObjectId;
  private createdTime: string;
  private subscriptions: ObjectId[];
  private groups: ObjectId[];
  private magazines: ObjectId[];
  private board: ObjectId[];
  private post: ObjectId[];
  private userRelations: ObjectId[];
  private userType: UserType;
  private name: string;

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
    userType: UserType.Business | UserType.Personal,
    name: string,
  ) {
    this.clerkId = clerkId;
    this.email = email;
    this.username = username;
    this.description = description;
    this.profilePhotoUrl = profilePhotoUrl;
    this.countryRegion = countryRegion;
    this.isActive = isActive;
    this.contact = contact;
    this.createdTime = createdTime;
    this.subscriptions = subscriptions ?? [];
    this.groups = groups ?? [];
    this.magazines = magazines ?? [];
    this.board = board ?? [];
    this.post = post ?? [];
    this.userRelations = userRelations ?? [];
    this.userType = userType;
    this.name = name;
  }

  getClerkId(): string {
    return this.clerkId;
  }

  getEmail(): string {
    return this.email;
  }

  getUsername(): string {
    return this.username;
  }

  getDescription(): string {
    return this.description;
  }

  getProfilePhotoUrl(): string {
    return this.profilePhotoUrl;
  }

  getCountryRegion(): string {
    return this.countryRegion;
  }

  getIsActive(): boolean {
    return this.isActive;
  }

  getContact(): ObjectId {
    return this.contact;
  }

  getCreatedTime(): string {
    return this.createdTime;
  }

  getSubscriptions(): ObjectId[] {
    return this.subscriptions;
  }

  getGroups(): ObjectId[] {
    return this.groups;
  }

  getMagazines(): ObjectId[] {
    return this.magazines;
  }

  getBoard(): ObjectId[] {
    return this.board;
  }

  getPost(): ObjectId[] {
    return this.post;
  }

  getUserRelations(): ObjectId[] {
    return this.userRelations;
  }

  getUserType(): UserType {
    return this.userType;
  }

  getName(): string {
    return this.name;
  }
}
