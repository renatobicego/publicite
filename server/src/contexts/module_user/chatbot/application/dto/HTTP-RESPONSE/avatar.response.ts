import { Field, ID, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class AvatarResponse {
  @Field(() => ID)
  _id: string;

  @Field(() => String)
  userId: string;

  @Field(() => String)
  name: string;

  @Field(() => String)
  context: string;

  @Field(() => String, {
    description: 'Semilla para generar la imagen del avatar (Blobatar)',
  })
  seed: string;

  @Field(() => Date, { nullable: true })
  createdAt?: Date;

  @Field(() => Date, { nullable: true })
  updatedAt?: Date;
}
