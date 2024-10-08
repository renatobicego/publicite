import { Field, ObjectType } from '@nestjs/graphql';
import { ObjectId } from 'mongoose';

@ObjectType()
export class GroupResponse {
  @Field(() => String)
  _id: string;

  @Field(() => [String])
  members: ObjectId[];

  @Field(() => [String])
  admins: ObjectId[];

  @Field(() => String)
  name: string;

  @Field(() => String)
  rules: string;

  @Field(() => [String])
  magazines: ObjectId[];

  @Field(() => String)
  details: string;

  @Field(() => String)
  profilePhotoUrl: string;

  @Field(() => String)
  visibility: string;

  constructor(group: any) {
    this._id = group._id;
    this.members = group.members;
    this.admins = group.admins;
    this.name = group.name;
    this.rules = group.rules;
    this.magazines = group.magazines;
    this.details = group.details;
    this.profilePhotoUrl = group.profilePhotoUrl;
    this.visibility = group.visibility;
  }
}

@ObjectType()
export class GroupListResponse {
  @Field(() => [GroupResponse])
  groups: GroupResponse[];

  @Field(() => Boolean)
  hasMore: boolean;
}
