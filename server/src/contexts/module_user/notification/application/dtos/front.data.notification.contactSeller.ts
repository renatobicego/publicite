import { ObjectType, Field, Int } from "@nestjs/graphql";

@ObjectType()
export class PostContactSeller {
    @Field(() => String)
    _id: string;
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
