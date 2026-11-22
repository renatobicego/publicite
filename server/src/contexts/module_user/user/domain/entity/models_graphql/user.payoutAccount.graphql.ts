import { Field, InputType, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class User_PayoutAccount_Graphql_Model {
  @Field(() => String, { nullable: true })
  label?: string | null;

  /** Alias (6-20) o CBU/CVU (22 dígitos). */
  @Field(() => String)
  aliasCbu: string;
}

@InputType()
export class User_PayoutAccount_Input {
  @Field(() => String, { nullable: true })
  label?: string | null;

  @Field(() => String)
  aliasCbu: string;
}
