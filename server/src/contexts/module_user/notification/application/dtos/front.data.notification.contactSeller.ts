import { ObjectType, Field, Int } from '@nestjs/graphql';

@ObjectType()
export class PostContactSeller {
  @Field(() => String)
  _id: string;

  @Field(() => String)
  title: string;

  @Field(() => String)
  description: string;

  @Field(() => String)
  postType: string;

  @Field(() => String)
  price: string;

  @Field(() => [String], { nullable: true })
  imagesUrls: string[];

  @Field(() => String, { nullable: true })
  petitionType: string;

  @Field(() => String, { nullable: true })
  toPrice: string;

  @Field(() => String, { nullable: true })
  frequencyPrice: string;
}

@ObjectType()
export class ClientContactSeller {
  @Field(() => String, { nullable: true })
  _id: string;

  @Field(() => String)
  name: string;

  @Field(() => String)
  email: string;

  @Field(() => String)
  lastName: string;

  @Field(() => String, { nullable: true })
  username: string;

  @Field(() => String, { nullable: true })
  phone: string;

  @Field(() => String)
  message: string;
}

@ObjectType()
export class front_data_CONTACTSELLER {
  @Field(() => PostContactSeller)
  post: PostContactSeller;

  @Field(() => ClientContactSeller)
  client: ClientContactSeller;
}
