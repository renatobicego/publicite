import { Field, ObjectType, registerEnumType } from '@nestjs/graphql';

export enum ContactSellerGetType {
  post = 'post',
  profile = 'profile',
}

registerEnumType(ContactSellerGetType, {
  name: 'contactSellerGetType',
  description: 'Define el tipo de get',
});

@ObjectType()
export class PostContactSeller_graphql {
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

  @Field(() => [String])
  imagesUrls: string[];

  @Field(() => String, { nullable: true })
  petitionType: string;

  @Field(() => String, { nullable: true })
  toPrice: string;

  @Field(() => String, { nullable: true })
  frequencyPrice: string;
}
@ObjectType()
export class ClientContactSeller_graphql {
  @Field(() => String, { nullable: true })
  clientId: string;

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
export class ContactSeller_Graphql {
  @Field(() => PostContactSeller_graphql)
  post: PostContactSeller_graphql;

  @Field(() => ClientContactSeller_graphql)
  client: ClientContactSeller_graphql;

  @Field(() => Date)
  date: Date;

  @Field(() => Boolean)
  isOpinionRequested: boolean;
}
