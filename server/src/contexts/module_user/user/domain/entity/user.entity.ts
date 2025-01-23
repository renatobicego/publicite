import { ObjectId } from 'mongoose';
import { UserType } from './enum/user.enums';

export interface UserPreferences {
  searchPreference: ObjectId[] | [];
  backgroundColor: number | undefined;
}

export class User {
  private _id?: ObjectId;
  private clerkId: string;
  private email: string;
  private username: string;
  private description: string;
  private profilePhotoUrl: string;
  private countryRegion: string;
  private name: string;
  private lastName: string;
  private isActive: boolean;
  private contact?: ObjectId | undefined;
  private createdTime?: string;
  private subscriptions?: ObjectId[];
  private groups?: ObjectId[];
  private magazines?: ObjectId[];
  private board?: ObjectId | undefined;
  private posts?: ObjectId[];
  private userRelations?: ObjectId[];
  private userType?: UserType;
  private userPreferences?: UserPreferences;
  private notifications?: any[];
  private friendRequests?: any[];
  private activeRelations?: ObjectId[];

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
    userType: UserType,
    contact?: ObjectId,
    createdTime?: string,
    subscriptions?: ObjectId[],
    groups?: ObjectId[],
    magazines?: ObjectId[],
    board?: ObjectId | undefined,
    posts?: ObjectId[],
    userRelations?: ObjectId[],
    userPreferences?: UserPreferences,
    _id?: ObjectId,
    notifications?: any[],
    friendRequests?: any[],
    activeRelations?:ObjectId[],
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
    this.userType = userType;
    this.contact = contact;
    this.createdTime = createdTime;
    this.subscriptions = subscriptions ?? [];
    this.groups = groups ?? [];
    this.magazines = magazines ?? [];
    this.board = board ?? undefined;
    this.posts = posts ?? [];
    this.userRelations = userRelations ?? [];
    this.userPreferences = userPreferences ?? {
      searchPreference: [],
      backgroundColor: undefined,
    };
    this._id = _id;
    this.notifications = notifications ?? [];
    this.friendRequests = friendRequests ?? [];
    this.activeRelations = activeRelations ?? [];
  }

  setContact(contact: ObjectId) {
    this.contact = contact;
  }

  get getNotifications() {
    return this.notifications;
  }
  get getFriendRequests() {
    return this.friendRequests;
  }

  get getId() {
    return this._id;
  }
  get getClerkId() {
    return this.clerkId;
  }

  get getEmail() {
    return this.email;
  }

  get getUsername() {
    return this.username;
  }

  get getDescription() {
    return this.description;
  }

  get getProfilePhotoUrl() {
    return this.profilePhotoUrl;
  }

  get getCountryRegion() {
    return this.countryRegion;
  }

  get getIsActive() {
    return this.isActive;
  }

  get getContact() {
    return this.contact;
  }

  get getCreatedTime() {
    return this.createdTime;
  }

  get getSubscriptions() {
    return this.subscriptions;
  }

  get getGroups() {
    return this.groups;
  }

  get getMagazines() {
    return this.magazines;
  }

  get getBoard() {
    return this.board;
  }

  get getPost() {
    return this.posts;
  }

  get getUserRelations() {
    return this.userRelations;
  }

  get getUserType() {
    return this.userType;
  }

  get getName() {
    return this.name;
  }

  get getLastName() {
    return this.lastName;
  }
  get getUserPreferences() {
    return this.userPreferences;
  }
  

  get getActiveRelations(){
    return this.activeRelations; 
  }
}
