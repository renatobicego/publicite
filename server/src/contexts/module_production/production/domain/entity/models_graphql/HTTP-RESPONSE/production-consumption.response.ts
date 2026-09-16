import { Field, Float, ID, Int, ObjectType } from '@nestjs/graphql';

import {
  ProductionOwnerType,
  ProductionRole,
} from '../../enum/production.enums';
import { ProductionLimitsResponse } from './production.response';

@ObjectType({ description: 'Tokens Publicité de IA del usuario (token bucket)' })
export class ProductionTokenConsumptionResponse {
  @Field(() => String, { description: "'plan' | 'free' | 'anonymous'" })
  source: string;

  @Field(() => Float)
  allowance: number;

  @Field(() => Float)
  used: number;

  @Field(() => Float)
  remaining: number;

  @Field(() => Date, { nullable: true })
  resetsAt?: Date | null;
}

@ObjectType({ description: 'Archivos usados vs. límite de un blog (PC-05, SB-05)' })
export class ProductionBlogConsumptionResponse {
  @Field(() => ID)
  productionId: string;

  @Field(() => String)
  title: string;

  @Field(() => ProductionOwnerType)
  ownerType: ProductionOwnerType;

  @Field(() => ProductionRole)
  role: ProductionRole;

  @Field(() => Int)
  filesCount: number;

  @Field(() => Int, { description: 'Límite del plan del creator del blog' })
  filesPerBlogLimit: number;

  @Field(() => Int)
  filesAvailable: number;
}

@ObjectType({ description: 'CONTROL Consumo del Panel de Control' })
export class ProductionConsumptionResponse {
  @Field(() => ProductionTokenConsumptionResponse, {
    nullable: true,
    description: 'null si no se pudo consultar el saldo de tokens',
  })
  tokens?: ProductionTokenConsumptionResponse | null;

  @Field(() => ProductionLimitsResponse)
  limits: ProductionLimitsResponse;

  @Field(() => [ProductionBlogConsumptionResponse])
  blogs: ProductionBlogConsumptionResponse[];
}
