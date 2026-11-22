import { Field, InputType, Int, ObjectType } from '@nestjs/graphql';
import {
  AdSpaceBand,
  AdSpaceCoverage,
  AdSpaceEdition,
  AdSpaceMedium,
} from '../enum/post-adspace.enums';

/** Datos del espacio publicitario (ver `normalizeAdSpace` para las reglas). */
@InputType()
export class AdSpaceInput {
  @Field(() => AdSpaceMedium)
  medium: AdSpaceMedium;

  @Field(() => String, { description: 'Emisora, canal, diario, cuenta…' })
  mediaName: string;

  @Field(() => String, { nullable: true })
  audience?: string | null;

  @Field(() => [String], { nullable: true })
  formats?: string[];

  @Field(() => String, { nullable: true })
  mediaUrl?: string | null;

  @Field(() => AdSpaceCoverage, { nullable: true })
  coverageArea?: AdSpaceCoverage | null;

  @Field(() => String, { nullable: true })
  coverageName?: string | null;

  @Field(() => String, { nullable: true })
  placeAddress?: string | null;

  @Field(() => AdSpaceBand, { nullable: true })
  band?: AdSpaceBand | null;

  @Field(() => String, { nullable: true })
  frequency?: string | null;

  @Field(() => String, { nullable: true })
  platform?: string | null;

  @Field(() => String, { nullable: true })
  program?: string | null;

  @Field(() => String, { nullable: true })
  schedule?: string | null;

  @Field(() => String, { nullable: true })
  outdoorType?: string | null;

  @Field(() => String, { nullable: true })
  dimensions?: string | null;

  @Field(() => Boolean, { nullable: true })
  illuminated?: boolean | null;

  @Field(() => AdSpaceEdition, { nullable: true })
  edition?: AdSpaceEdition | null;

  @Field(() => String, { nullable: true })
  periodicity?: string | null;

  @Field(() => String, { nullable: true })
  circulation?: string | null;

  @Field(() => String, { nullable: true })
  section?: string | null;

  @Field(() => [String], { nullable: true })
  networks?: string[];

  @Field(() => String, { nullable: true })
  handle?: string | null;

  @Field(() => Int, { nullable: true })
  followers?: number | null;

  @Field(() => String, { nullable: true })
  engagement?: string | null;
}

@ObjectType()
export class AdSpace_Graphql {
  @Field(() => String, { nullable: true })
  medium: string;

  @Field(() => String, { nullable: true })
  mediaName: string;

  @Field(() => String, { nullable: true })
  audience?: string | null;

  @Field(() => [String], { nullable: true })
  formats?: string[];

  @Field(() => String, { nullable: true })
  mediaUrl?: string | null;

  @Field(() => String, { nullable: true })
  coverageArea?: string | null;

  @Field(() => String, { nullable: true })
  coverageName?: string | null;

  @Field(() => String, { nullable: true })
  placeAddress?: string | null;

  @Field(() => String, { nullable: true })
  band?: string | null;

  @Field(() => String, { nullable: true })
  frequency?: string | null;

  @Field(() => String, { nullable: true })
  platform?: string | null;

  @Field(() => String, { nullable: true })
  program?: string | null;

  @Field(() => String, { nullable: true })
  schedule?: string | null;

  @Field(() => String, { nullable: true })
  outdoorType?: string | null;

  @Field(() => String, { nullable: true })
  dimensions?: string | null;

  @Field(() => Boolean, { nullable: true })
  illuminated?: boolean | null;

  @Field(() => String, { nullable: true })
  edition?: string | null;

  @Field(() => String, { nullable: true })
  periodicity?: string | null;

  @Field(() => String, { nullable: true })
  circulation?: string | null;

  @Field(() => String, { nullable: true })
  section?: string | null;

  @Field(() => [String], { nullable: true })
  networks?: string[];

  @Field(() => String, { nullable: true })
  handle?: string | null;

  @Field(() => Int, { nullable: true })
  followers?: number | null;

  @Field(() => String, { nullable: true })
  engagement?: string | null;
}
