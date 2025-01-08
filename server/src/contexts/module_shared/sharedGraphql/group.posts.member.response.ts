import { Field, Float, ID, ObjectType } from '@nestjs/graphql';
import { ObjectId } from 'mongoose';

@ObjectType()
class location_of_group_posts {
    @Field(() => String, { nullable: true })
    description: string;
}

@ObjectType()
export class Post_of_members_group {
    @Field(() => ID, { nullable: true })
    _id?: ObjectId;

    @Field(() => [String], { nullable: true },)
    imagesUrls: string[];

    @Field(() => String, { nullable: true })
    title: string;

    @Field(() => String, { nullable: true })
    description: string;

    @Field(() => Float, { nullable: true })
    price: number;

    // @Field(() => String, { nullable: true })
    // reviews: string[];

    @Field(() => String, { nullable: true })
    frequencyPrice: string;

    @Field(() => Float, { nullable: true })
    toPrice: number;

    @Field(() => String, { nullable: true })
    petitionType: string;

    @Field(() => String, { nullable: true })
    postType: string;

    @Field(() => location_of_group_posts, { nullable: true })
    location: location_of_group_posts;



}


@ObjectType()
export class GroupPostMemberResponse {

    @Field(() => String)
    _id: string;

    @Field(() => String)
    username: string;

    @Field(() => String)
    name: string;

    @Field(() => String)
    lastName: string;

    @Field(() => String)
    profilePhotoUrl: string;

    @Field(() => [Post_of_members_group], { nullable: true })
    posts: Post_of_members_group[];


}



@ObjectType()
export class PostsMemberGroupResponse {
    @Field(() => [GroupPostMemberResponse])
    userAndPosts: GroupPostMemberResponse[];

    @Field(() => Boolean)
    hasMore: boolean;
}
