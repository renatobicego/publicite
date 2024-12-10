import { Field, ObjectType } from "@nestjs/graphql";
import { UserRelation } from "src/contexts/module_user/user/domain/entity/userRelation.entity";

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
    @Field(() => UserFrom_notification)
    userFrom: UserFrom_notification;

    @Field(() => String)
    typeRelation: string;



}