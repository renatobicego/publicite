import { Field, Float, ObjectType } from '@nestjs/graphql';
import { ObjectId } from 'mongoose';

@ObjectType()
export class posts_graphql_magazine {
  @Field(() => String, { nullable: true })
  _id: ObjectId;

  @Field(() => [String], { nullable: true })
  imagesUrls: string[];

  @Field(() => String, { nullable: true })
  title: string;

  @Field(() => String, { nullable: true })
  description: string;

  @Field(() => Float, { nullable: true })
  price: number;

  // @Field(() => String, { nullable: true })
  // reviews: string;

  @Field(() => String, { nullable: true })
  frequencyPrice: string;

  @Field(() => String, { nullable: true })
  petitionType: string;

  @Field(() => String, { nullable: true })
  postType: string;
}

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
export class sections_graphql_magazine {
  @Field(() => String, { nullable: true })
  _id: ObjectId;

  @Field(() => Boolean, { nullable: true })
  isFatherSection: boolean;

  @Field(() => [posts_graphql_magazine], { nullable: true })
  posts: posts_graphql_magazine[];

  @Field(() => String, { nullable: true })
  title: string;
}

@ObjectType()
export class group_graphql_magazine {
  @Field(() => String, { nullable: true })
  _id: ObjectId;

  @Field(() => String, { nullable: true })
  name: string;

  @Field(() => String, { nullable: true })
  profilePhotoUrl: string;
}

@ObjectType()
export class allowedColaborators_graphql_magazine {
  @Field(() => String, { nullable: true })
  _id: ObjectId;

  @Field(() => String, { nullable: true })
  username: string;

  @Field(() => String, { nullable: true })
  profilePhotoUrl: string;
}

@ObjectType()
export class user_graphql_magazine {
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

  @Field(() => [sections_graphql_magazine])
  sections: sections_graphql_magazine[];

  @Field(() => String)
  ownerType: string;

  @Field(() => String, { nullable: true })
  description?: string;

  //User Magazine
  @Field(() => [collaborators_graphql], { nullable: true })
  collaborators?: collaborators_graphql[];

  @Field(() => user_graphql_magazine, { nullable: true })
  user?: user_graphql_magazine;

  @Field(() => String, { nullable: true })
  visibility?: string;

  @Field(() => [allowedColaborators_graphql_magazine], { nullable: true })
  allowedColaborators?: allowedColaborators_graphql_magazine;

  @Field(() => group_graphql_magazine, { nullable: true })
  group?: group_graphql_magazine;

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
