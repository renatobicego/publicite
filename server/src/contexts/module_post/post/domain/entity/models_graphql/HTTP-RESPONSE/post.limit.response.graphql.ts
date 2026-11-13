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

    /*
    Extra temporal de un cambio de plan: hasta cuándo dura (ISO) y cómo quedan los
    límites cuando vence ("El dd/mm tu límite pasa a N"). null si no hay extra.
    */
    @Field(() => String, { nullable: true })
    carryoverExpiresAt?: string | null

    @Field(() => Number, { nullable: true })
    totalAgendaPostLimitAfterCarryover?: number | null

    @Field(() => Number, { nullable: true })
    totalLibrePostLimitAfterCarryover?: number | null

    @Field(() => Number, { nullable: true })
    contactLimitAfterCarryover?: number | null


}