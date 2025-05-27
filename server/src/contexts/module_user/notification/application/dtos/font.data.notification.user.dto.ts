import { Field, ID, ObjectType } from "@nestjs/graphql";
import { ObjectId } from "mongoose";


@ObjectType()
class UserFrom_notification {
    @Field(() => String)
    _id: string;

    @Field(() => String)
    username: string;

    @Field(() => String)
    profilePhotoUrl: string;
}






@ObjectType()
export class front_data_USER {

    @Field(() => ID, { nullable: true })
    _id: ObjectId;


    @Field(() => UserFrom_notification)
    userFrom: UserFrom_notification;

    @Field(() => String)
    typeRelation: string;



}