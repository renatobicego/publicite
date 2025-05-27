import { Field, InputType } from '@nestjs/graphql';
import { ObjectId } from 'mongoose';


import { OwnerType } from 'src/contexts/module_magazine/magazine/domain/entity/enum/magazine.ownerType.enum';

@InputType()
export class MagazineCreateRequest {
  @Field(() => String)
  name: string;

  @Field(() => [String])
  sections: ObjectId[];

  @Field(() => OwnerType)
  ownerType: OwnerType;

  @Field(() => String, { nullable: true })
  description?: string;

  @Field(() => String, { nullable: true })
  addedPost?: ObjectId;

  // User Magazines Atributes
  @Field(() => [String], { nullable: true })
  collaborators?: ObjectId[];

  @Field(() => String, { nullable: true })
  user?: ObjectId;

  @Field(() => String, { nullable: true })
  visibility?: string;

  // Group Magazines Atributes

  @Field(() => [String], { nullable: true })
  allowedCollaborators?: ObjectId[];

  @Field(() => String, { nullable: true })
  group?: ObjectId;
}
