import { Field, ID, InputType } from '@nestjs/graphql';
import {
  IsEnum,
  IsMongoId,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

import {
  ProductionModerationAction,
  ProductionReportReason,
} from '../../enum/production-report.enums';

@InputType({ description: 'Denuncia de un blog o de un contenido (DEN-01)' })
export class ProductionReportInput {
  @Field(() => ID)
  @IsMongoId()
  productionId: string;

  @Field(() => ID, {
    nullable: true,
    description: 'Archivo, artículo o carpeta; vacío = el blog',
  })
  @IsOptional()
  @IsMongoId()
  itemId?: string;

  @Field(() => ProductionReportReason)
  @IsEnum(ProductionReportReason)
  reason: ProductionReportReason;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  details?: string;
}

@InputType({ description: 'Revisión del admin (DEN-03)' })
export class ProductionModerationInput {
  @Field(() => ID)
  @IsMongoId()
  productionId: string;

  @Field(() => ID, { nullable: true, description: 'Vacío = el blog' })
  @IsOptional()
  @IsMongoId()
  itemId?: string;

  @Field(() => ProductionModerationAction)
  @IsEnum(ProductionModerationAction)
  action: ProductionModerationAction;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  note?: string;
}
