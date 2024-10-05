import { Field, ObjectType } from '@nestjs/graphql';
import { ObjectId } from 'mongoose';

// CONSULTAR SI QUIERE EL POPULATE EN EL FRONT O NO
// En el caso de que si hay que armar un objeto en users para poder devolverlo

@ObjectType()
export class MagazineResponse {
  @Field(() => String)
  _id: ObjectId;

  @Field(() => String)
  name: string;

  @Field(() => [String])
  sections: ObjectId[];

  @Field(() => String)
  ownerType: string;

  @Field(() => String, { nullable: true })
  description?: string;

  //User Magazine
  @Field(() => [String], { nullable: true })
  collaborators?: any[];

  @Field(() => String, { nullable: true })
  user?: any;

  @Field(() => String, { nullable: true })
  visibility?: string;

  @Field(() => [String], { nullable: true })
  allowedColaborators?: string;

  @Field(() => [String], { nullable: true })
  group?: string;

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
