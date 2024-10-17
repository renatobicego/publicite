import { Field, ObjectType } from '@nestjs/graphql';
import { ObjectId } from 'mongoose';

@ObjectType()
export class members_graphQl {
  @Field(() => String)
  _id: string;

  @Field(() => String)
  username: string;

  @Field(() => String, { nullable: true })
  profilePhotoUrl: string;
}
@ObjectType()
export class post_magazines_section {
  @Field(() => String)
  imagesUrls: string;
}

@ObjectType()
export class magazines_section {
  @Field(() => post_magazines_section, { nullable: true })
  posts: post_magazines_section;
}

@ObjectType()
export class magazines_graphQl {
  @Field(() => String)
  _id: string;

  @Field(() => String)
  name: string;

  @Field(() => magazines_section, { nullable: true })
  sections: magazines_section;

  @Field(() => String)
  description: string;
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

  @Field(() => String, { nullable: true })
  rules: string;

  @Field(() => [String], { nullable: true })
  magazines: ObjectId[];

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
