import { Field, ObjectType } from "@nestjs/graphql";


@ObjectType()
class user_front_data_post {
    @Field(() => String)
    username: string
}

@ObjectType()
class post_front_data_post {
    @Field(() => String)
    _id: string

    @Field(() => String)
    title: string

    @Field(() => String)
    imageUrl: string

    @Field(() => String)
    postType: string

}

@ObjectType()
class post_front_data_postReaction {
    @Field(() => String)
    emoji: string
}


@ObjectType()
export class front_data_POST {

    @Field(() => user_front_data_post)
    user: user_front_data_post

    @Field(() => post_front_data_post)
    post: post_front_data_post;

    @Field(() => post_front_data_postReaction, { nullable: true })
    postReaction: post_front_data_postReaction;




}