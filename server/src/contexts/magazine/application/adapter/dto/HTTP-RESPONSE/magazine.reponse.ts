import { Field, ObjectType } from '@nestjs/graphql';
import { ObjectId } from 'mongoose';

// CONSULTAR SI QUIERE EL POPULATE EN EL FRONT O NO
// En el caso de que si hay que armar un objeto en users para poder devolverlo

@ObjectType()
export class collaborators_graphql {
  @Field(() => String, { nullable: true })
  _id: ObjectId;

  @Field(() => String, { nullable: true })
  username: string;

  @Field(() => String, { nullable: true })
  profilePhotoUrl: string;
}

@ObjectType()
export class sections_graphql {
  @Field(() => String, { nullable: true })
  _id: ObjectId;

  @Field(() => Boolean, { nullable: true })
  isFatherSection: boolean;

  // @Field(() => String, { nullable: true })
  // posts: string;

  @Field(() => String, { nullable: true })
  title: string;
}

@ObjectType()
export class group_graphql {
  @Field(() => String, { nullable: true })
  _id: ObjectId;

  @Field(() => String, { nullable: true })
  name: string;

  @Field(() => String, { nullable: true })
  profilePhotoUrl: string;
}

@ObjectType()
export class allowedColaborators_graphql {
  @Field(() => String, { nullable: true })
  _id: ObjectId;

  @Field(() => String, { nullable: true })
  username: string;

  @Field(() => String, { nullable: true })
  profilePhotoUrl: string;
}

@ObjectType()
export class user_graphql {
  @Field(() => String, { nullable: true })
  _id: ObjectId;

  @Field(() => String, { nullable: true })
  username: string;

  @Field(() => String, { nullable: true })
  profilePhotoUrl: string;
}

@ObjectType()
export class MagazineResponse {
  @Field(() => String)
  _id: ObjectId;

  @Field(() => String)
  name: string;

  @Field(() => [sections_graphql])
  sections: sections_graphql[];

  @Field(() => String)
  ownerType: string;

  @Field(() => String, { nullable: true })
  description?: string;

  //User Magazine
  @Field(() => [collaborators_graphql], { nullable: true })
  collaborators?: collaborators_graphql[];

  @Field(() => user_graphql, { nullable: true })
  user?: user_graphql;

  @Field(() => String, { nullable: true })
  visibility?: string;

  @Field(() => [allowedColaborators_graphql], { nullable: true })
  allowedColaborators?: allowedColaborators_graphql;

  @Field(() => group_graphql, { nullable: true })
  group?: group_graphql;

  constructor(magazine: any) {
    this._id = magazine._id;
    this.name = magazine.name;
    this.sections = magazine.sections;
    this.ownerType = magazine.ownerType;
    this.description = magazine.description;
    this.collaborators = magazine.collaborators;
    this.user = magazine.user;
    this.visibility = magazine.visibility;
    this.allowedColaborators = magazine.allowedColaborators;
    this.group = magazine.group;
  }
}
