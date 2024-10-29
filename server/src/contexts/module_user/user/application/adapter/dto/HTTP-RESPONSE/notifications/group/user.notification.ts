import { ObjectType, Field } from "@nestjs/graphql";

@ObjectType()
export class front_data_GROUP {
  @Field(() => String)
  _id: string;

  @Field(() => String)
  name: string;

  @Field(() => String)
  profilePhotoUrl: string;
}
