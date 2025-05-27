import { Field, Float, ID, ObjectType } from '@nestjs/graphql';
import { ObjectId } from 'mongoose';

@ObjectType()
class location_of_group_posts {
    @Field(() => String, { nullable: true })
    description: string;
}

@ObjectType()
class author_post_group_member {
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
}



@ObjectType()
export class Post_of_members_group {
    @Field(() => ID, { nullable: true })
    _id?: ObjectId;

    @Field(() => author_post_group_member, { nullable: true },)
    author: author_post_group_member;

    @Field(() => [String], { nullable: true },)
    imagesUrls: string[];

    @Field(() => String, { nullable: true })
    title: string;

    @Field(() => String, { nullable: true })
    description: string;

    @Field(() => Float, { nullable: true })
    price: number;

    @Field(() => [review_post_group_member], { nullable: true })
    reviews: review_post_group_member[];

    @Field(() => String, { nullable: true })
    frequencyPrice: string;

    @Field(() => Float, { nullable: true })
    toPrice: number;

    @Field(() => String, { nullable: true })
    petitionType: string;

    @Field(() => String, { nullable: true })
    postType: string;

    @Field(() => location_of_group_posts, { nullable: true })
    geoLocation: location_of_group_posts;



}


@ObjectType()
export class review_post_group_member {
  @Field(() => String, { nullable: true })
  _id: string;

  @Field(() => String, { nullable: true })
  author: string;

  @Field(() => String, { nullable: true })
  review: string;

  @Field(() => Date, { nullable: true })
  date: Date;

  @Field(() => Float, { nullable: true })
  rating: number;
}


@ObjectType()
export class GroupPostMemberResponse {



    @Field(() => [Post_of_members_group], { nullable: true })
    posts: Post_of_members_group[];


}



@ObjectType()
export class PostsMemberGroupResponse {
    @Field(() => [Post_of_members_group])
    userAndPosts: Post_of_members_group[];

    @Field(() => Boolean)
    hasMore: boolean;
}
