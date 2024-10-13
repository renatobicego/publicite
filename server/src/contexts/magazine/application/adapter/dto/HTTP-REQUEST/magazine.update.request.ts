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

  @Field(() => String, { nullable: true })
  user: string;

  @Field(() => String, { nullable: true })
  visibility: string;
}
