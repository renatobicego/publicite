import { Field, ObjectType } from '@nestjs/graphql';
import { ObjectId } from 'mongoose';

@ObjectType()
export class posts_magazine_create_response_ {
    @Field(() => String, { nullable: true })
    _id: ObjectId;


}



@ObjectType()
export class section_magazine_create_response_ {
    @Field(() => String, { nullable: true })
    _id: ObjectId;

    @Field(() => Boolean, { nullable: true })
    isFatherSection: boolean;

    @Field(() => [posts_magazine_create_response_], { nullable: true })
    posts: posts_magazine_create_response_[];

    @Field(() => String, { nullable: true })
    title: string;

}



@ObjectType()
export class MagazineCreateResponse {
    @Field(() => String)
    _id: ObjectId;

    @Field(() => String)
    name: string;

    @Field(() => [section_magazine_create_response_])
    sections: section_magazine_create_response_[];

    @Field(() => String)
    ownerType: string;

}
