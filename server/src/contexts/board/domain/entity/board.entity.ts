import { Field, ID, ObjectType } from '@nestjs/graphql';
import { ObjectId } from 'mongoose';

@ObjectType()
export class Board {
  @Field(() => ID, { nullable: true })
  private _id?: ObjectId;

  @Field(() => [String], { nullable: true })
  private annotations: string[];

  @Field(() => String, { nullable: true })
  private visibility: string;

  @Field(() => String, { nullable: true })
  private user: ObjectId;

  @Field(() => String, { nullable: true })
  private color: string;

  @Field(() => [String], { nullable: true })
  private keywords: string[];

  constructor(
    annotations: string[],
    visibility: string,
    user: ObjectId,
    color: string,
    keywords: string[],
    id?: ObjectId,
  ) {
    this.annotations = annotations;
    this.visibility = visibility;
    this.user = user;
    this.color = color ?? '';
    this.keywords = keywords;
    this._id = id;
  }

  get getId() {
    return this._id;
  }

  get getkeywords() {
    return this.keywords;
  }

  get getAnnotations() {
    return this.annotations;
  }

  get getVisibility() {
    return this.visibility;
  }

  get getUser() {
    return this.user;
  }

  get getColor() {
    return this.color;
  }
}
