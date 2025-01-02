import { Field, ObjectType } from "@nestjs/graphql";


@ObjectType()
class user_front_data_post {
    @Field(() => String)
    username: string
}

@ObjectType()
class post_front_data_post {
    @Field(() => String)
    postId: string
    @Field(() => String)
    title: string
    @Field(() => String)
    imageUrl: string
}
@ObjectType()
export class front_data_POST {

    @Field(() => user_front_data_post, { nullable: true })
    user: user_front_data_post

    @Field(() => post_front_data_post)
    post: post_front_data_post;

    @Field(() => String)
    emoji: string


}