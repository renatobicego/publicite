import { Field, ObjectType } from '@nestjs/graphql';
import { ObjectId } from 'mongoose';
import { OwnerType } from 'src/contexts/magazine/domain/entity/enum/magazine.ownerType.enum';

@ObjectType()
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
  @Field(() => [String])
  colaborators: ObjectId[];

  @Field(() => String)
  user: ObjectId;

  @Field(() => String)
  visibility: ObjectId;

  // Group Magazines Atributes

  @Field(() => [String])
  allowedColaborators: ObjectId[];

  @Field(() => [String])
  group: ObjectId[];
}
