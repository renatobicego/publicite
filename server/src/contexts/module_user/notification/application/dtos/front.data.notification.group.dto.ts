import { ObjectType, Field } from "@nestjs/graphql";


@ObjectType()
export class userInviting_group {
    @Field(() => String, { nullable: true })
    _id: string;
    @Field(() => String, { nullable: true })
    username: string;

}



@ObjectType()
export class front_data_GROUP {
    @Field(() => String)
    _id: string;

    @Field(() => String)
    name: string;

    @Field(() => String)
    profilePhotoUrl: string;

    @Field(() => userInviting_group, { nullable: true })
    userInviting: userInviting_group;

}
