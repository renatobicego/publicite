import { ObjectId } from 'mongoose';

export class UserRelation {
  private userA: string;
  private userB: string;
  private typeRelationA: string;
  private typeRelationB: string;

  constructor(
    userA: string,
    userB: string,
    typeRelationA: string,
    typeRelationB: string,
  ) {
    this.userA = userA;
    this.userB = userB;
    this.typeRelationA = typeRelationA;
    this.typeRelationB = typeRelationB;
  }


  get getUserA() {
    return this.userA;
  }

  get getUserB() {
    return this.userB;
  }
}
