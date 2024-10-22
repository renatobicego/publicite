import { Field, ID, ObjectType } from '@nestjs/graphql';
import { ObjectId } from 'mongoose';

@ObjectType()
export class members_graphQl {
  @Field(() => String)
  _id: string;

  @Field(() => String)
  username: string;

  @Field(() => String, { nullable: true })
  profilePhotoUrl: string;

  @Field(() => String, { nullable: true })
  name: string;

  @Field(() => String, { nullable: true })
  lastName: string;

  @Field(() => String, { nullable: true })
  businessName: string;
}
@ObjectType()
export class post_graphql_group {
  @Field(() => ID, { nullable: true })
  _id?: ObjectId;

  @Field(() => [String], { nullable: true })
  imagesUrls: string[];
}
@ObjectType()
export class sections_graphql_group {
  @Field(() => ID, { nullable: true })
  _id?: ObjectId;

  @Field(() => [post_graphql_group], { nullable: true })
  posts: post_graphql_group[];
}

@ObjectType()
export class magazine_graphql_group {
  @Field(() => ID, { nullable: true })
  _id?: ObjectId;

  @Field(() => String, { nullable: true })
  name: string;

  @Field(() => [sections_graphql_group], { nullable: true })
  sections: sections_graphql_group[];
}

@ObjectType()
export class GroupResponse_admins {
  @Field(() => String)
  _id: string;

  @Field(() => String)
  username: string;
}

@ObjectType()
export class GroupResponse {
  @Field(() => String)
  _id: ObjectId;

  @Field(() => [members_graphQl], { nullable: true })
  members: members_graphQl[];

  @Field(() => [GroupResponse_admins], { nullable: true })
  admins: GroupResponse_admins[];

  @Field(() => String)
  name: string;

  @Field(() => String)
  creator: string;

  @Field(() => String, { nullable: true })
  rules: string;

  @Field(() => [magazine_graphql_group], { nullable: true })
  magazines: magazine_graphql_group[];

  @Field(() => String, { nullable: true })
  details: string;

  @Field(() => String, { nullable: true })
  profilePhotoUrl: string;

  @Field(() => String)
  visibility: string;

  constructor(group: any) {
    this._id = group._id;
    this.members = group.members;
    this.admins = group.admins ?? [];
    this.name = group.name;
    this.creator = group.creator;
    this.rules = group.rules;
    this.magazines = group.magazines ?? [];
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
