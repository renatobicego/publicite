import { Field, InputType } from '@nestjs/graphql';
import { OwnerType } from 'src/contexts/module_magazine/magazine/domain/entity/enum/magazine.ownerType.enum';

@InputType()
export class MagazineUpdateRequest {
  @Field(() => String)
  _id: string;

  @Field(() => String, { nullable: true })
  name?: string;

  @Field(() => OwnerType)
  ownerType: OwnerType;

  @Field(() => String, { nullable: true })
  description?: string;

  @Field(() => String, { nullable: true })
  visibility?: string;
}
