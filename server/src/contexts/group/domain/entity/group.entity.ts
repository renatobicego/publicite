import { ObjectId } from 'mongoose';

export class Group {
  private members: ObjectId[];
  private admins: ObjectId[];
  private name: string;
  private alias: string;
  private creator: string;
  private rules: string;
  private magazines: ObjectId[];
  private details: string;
  private profilePhotoUrl: string;
  private visibility: string;

  constructor(
    members: ObjectId[],
    admins: ObjectId[],
    name: string,
    alias: string,
    creator: string,
    rules: string,
    magazines: ObjectId[],
    details: string,
    profilePhotoUrl: string,
    visibility: string,
  ) {
    this.members = members ?? [];
    this.admins = admins ?? [];
    this.name = name;
    this.alias = alias;
    this.creator = creator;
    this.rules = rules ? rules : 'no rules';
    this.magazines = magazines ?? [];
    this.details = details ?? 'no details';
    this.profilePhotoUrl = profilePhotoUrl;
    this.visibility = visibility ?? 'public';
  }

  get getMembers() {
    return this.members;
  }
  get getAlias() {
    return this.alias;
  }

  get getAdmins() {
    return this.admins;
  }

  get getName() {
    return this.name;
  }

  get getRules() {
    return this.rules;
  }

  get getMagazines() {
    return this.magazines;
  }

  get getDetails() {
    return this.details;
  }

  get getProfilePhotoUrl() {
    return this.profilePhotoUrl;
  }

  get getVisibility() {
    return this.visibility;
  }
  get getCreator() {
    return this.creator;
  }
}
