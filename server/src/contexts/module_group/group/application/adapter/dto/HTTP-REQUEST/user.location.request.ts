import { Field, InputType } from "@nestjs/graphql";

@InputType()
export class UserLocation_group {
    @Field(() => Number)
    latitude: number;
    @Field(() => Number)
    longitude: number;

    
}