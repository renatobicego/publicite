import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class User_Credential_Graphql_Model {
  @Field(() => String, { nullable: true })
  credentialPhotoUrl?: string | null;

  @Field(() => String, { nullable: true })
  credentialColor?: string | null;

  /** Foto anterior (key de UploadThing), para que el cliente la borre. */
  @Field(() => String, { nullable: true })
  previousCredentialPhotoUrl?: string | null;
}
