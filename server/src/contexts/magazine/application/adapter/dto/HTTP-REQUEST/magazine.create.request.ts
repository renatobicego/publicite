import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { ObjectId } from 'mongoose';
import { OwnerType } from 'src/contexts/magazine/domain/entity/enum/magazine.ownerType.enum';

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
  colaborators: ObjectId[];

  @Field(() => String)
  user: ObjectId;

  @Field(() => String)
  visibility: string;

  // Group Magazines Atributes

  @Field(() => [String], { nullable: true })
  allowedColaborators: ObjectId[];

  @Field(() => [String], { nullable: true })
  group: ObjectId[];
}
