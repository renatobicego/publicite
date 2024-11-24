import { Field, ObjectType } from "@nestjs/graphql";
@ObjectType()
export class userInviting_magazine {
    @Field(() => String, { nullable: true })
    _id: string;
    @Field(() => String, { nullable: true })
    username: string;

}

@ObjectType()
export class groupInviting_magazine {
    @Field(() => String, { nullable: true })
    _id: string;

    @Field(() => String, { nullable: true })
    name: string;


}





@ObjectType()
export class front_data_MAGAZINE {
    @Field(() => String)
    _id: string;

    @Field(() => String)
    name: string;

    @Field(() => String)
    ownerType: string;

    @Field(() => userInviting_magazine, { nullable: true })
    userInviting: userInviting_magazine;

    @Field(() => groupInviting_magazine, { nullable: true })
    groupInviting: groupInviting_magazine;




}