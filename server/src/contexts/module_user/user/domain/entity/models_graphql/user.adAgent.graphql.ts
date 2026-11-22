import { Field, ObjectType } from '@nestjs/graphql';

/** Perfil público de una cuenta Empresa / Agente (espacios publicitarios). */
@ObjectType()
export class User_AdAgent_Graphql_Model {
  @Field(() => String)
  userId: string;

  @Field(() => String, { nullable: true })
  businessName?: string | null;

  @Field(() => String, { nullable: true })
  countryRegion?: string | null;

  @Field(() => String)
  website: string;

  @Field(() => String)
  taxCondition: string;

  @Field(() => String)
  taxNote: string;
}
