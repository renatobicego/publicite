import { Field, InputType } from "@nestjs/graphql";

@InputType()
export class UpdateContactRequest {
    @Field(() => String, { nullable: true })
    phone: string;

    @Field(() => String, { nullable: true })
    instagram: string;

    @Field(() => String, { nullable: true })
    facebook: string;

    @Field(() => String, { nullable: true })
    website: string;

    @Field(() => String, { nullable: true })
    x: string;
}

