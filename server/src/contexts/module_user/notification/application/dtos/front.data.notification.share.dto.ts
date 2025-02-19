import { ObjectType, Field, registerEnumType } from "@nestjs/graphql"
enum ShareType {
    post = 'post',
    group = 'group',
    magazine = 'magazine',
    user = 'user',
}

registerEnumType(ShareType, {
    name: 'ShareType',
    description: 'Type of share',
})

@ObjectType()
export class front_data_SHARE {
    @Field(() => ShareType)
    type: ShareType

    @Field(() => String)
    _id: string

    @Field(() => String)
    description: string

    @Field(() => String)
    username: string

    @Field(() => String, { nullable: true })
    imageUrl: string



}