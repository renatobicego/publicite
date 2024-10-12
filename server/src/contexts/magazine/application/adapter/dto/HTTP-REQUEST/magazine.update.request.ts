import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { ObjectId } from 'mongoose';
import { OwnerType } from 'src/contexts/magazine/domain/entity/enum/magazine.ownerType.enum';

@InputType()
export class MagazineUpdateRequest {
  @Field(() => String)
  _id: string;

  @Field(() => String, { nullable: true })
  name: string;

  @Field(() => [String], { nullable: true })
  sections: ObjectId[];

  @Field(() => OwnerType)
  ownerType: OwnerType;

  @Field(() => String, { nullable: true })
  description?: string;

  // User Magazines Atributes
  @Field(() => [String], { nullable: true })
  collaborators: ObjectId[];

  @Field(() => String, { nullable: true })
  user: string;

  @Field(() => String, { nullable: true })
  visibility: string;

  // Group Magazines Atributes

  @Field(() => [String], { nullable: true })
  allowedColaborators: ObjectId[];

  @Field(() => [String], { nullable: true })
  group: ObjectId[];
}
