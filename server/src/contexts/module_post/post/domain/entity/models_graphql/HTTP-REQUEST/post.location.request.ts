import { Field, InputType } from "@nestjs/graphql";

@InputType()
export class UserLocation {
    @Field(() => Number)
    latitude: number;
    @Field(() => Number)
    longitude: number;

    
}