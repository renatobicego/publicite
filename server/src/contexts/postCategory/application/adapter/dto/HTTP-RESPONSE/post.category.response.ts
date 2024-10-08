import { Field, ObjectType } from '@nestjs/graphql';
import { ObjectId } from 'mongoose';

@ObjectType()
export class PostCategoryResponse {
  @Field(() => String, { nullable: false })
  label: string;

  @Field(() => String, { nullable: false })
  _id: ObjectId;

  constructor(document: any) {
    this._id = document._id;
    this.label = document.label;
  }
}
