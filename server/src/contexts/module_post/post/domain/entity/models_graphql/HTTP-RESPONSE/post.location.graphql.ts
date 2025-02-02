import { ObjectType, Field, Float } from '@nestjs/graphql';

@ObjectType()
export class location {
  @Field(() => String)
  type: 'Point';
  @Field(() => [Float])
  coordinates: [number, number];
}

@ObjectType()
export class PostLocation_Grapql {
  @Field(() => location, { nullable: true })
  location: location;
  @Field(() => Boolean, { nullable: true })
  userSetted: boolean;
  @Field(() => String, { nullable: true })
  description: string;
}
