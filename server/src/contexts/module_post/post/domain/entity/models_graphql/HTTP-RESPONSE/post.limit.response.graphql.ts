import { Field, ObjectType } from "@nestjs/graphql";

@ObjectType()
export class PostLimitResponseGraphql {
    @Field(() => Number)
    agendaPostCount: number

    @Field(() => Number)
    librePostCount: number

    @Field(() => Number)
    totalAgendaPostLimit: number

    @Field(() => Number)
    totalLibrePostLimit: number

    @Field(() => Number)
    agendaAvailable: number

    @Field(() => Number)
    libreAvailable: number

    @Field(() => Number)
    contactLimit: number

    @Field(() => Number)
    contactCount: number

    @Field(() => Number)
    contactAvailable: number



}