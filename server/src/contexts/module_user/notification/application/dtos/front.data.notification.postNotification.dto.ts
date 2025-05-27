import { Field, Float, ObjectType } from "@nestjs/graphql";

@ObjectType()
class postCalificationPost {

    @Field(() => String, { nullable: true })
    _id: string

    @Field(() => String, { nullable: true })
    title: string

    @Field(() => String, { nullable: true })
    author: string

    @Field(() => String, { nullable: true })
    description: string

    @Field(() => [String], { nullable: true })
    imagesUrls: string[]

    @Field(() => String, { nullable: true })
    postType: string
}

@ObjectType()
class postCalificationReview {

    @Field(() => String, { nullable: true })
    author: string

    @Field(() => String, { nullable: true })
    review: string

    @Field(() => Date, { nullable: true })
    date: Date

    @Field(() => Float, { nullable: true })
    rating: number

}
@ObjectType()
export class front_data_POSTCALIFICATION {
    @Field(() => String, { nullable: true })
    postCalificationType: string

    @Field(() => postCalificationPost, { nullable: true })
    post: postCalificationPost

    @Field(() => String, { nullable: true })
    contactSeller_id: string

    @Field(() => postCalificationReview, { nullable: true })
    review: postCalificationReview


}