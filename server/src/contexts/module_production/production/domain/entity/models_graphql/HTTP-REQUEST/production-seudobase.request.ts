import { Field, Float, ID, InputType } from '@nestjs/graphql';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsEnum,
  IsMongoId,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

import { ProductionItemKind } from '../../enum/production.enums';
import { ProductionPriceChangeMode } from '../../enum/production-seudobase.enums';
import { Visibility } from 'src/contexts/module_post/post/domain/entity/enum/post-visibility.enum';

export const SEUDOBASE_MAX_ITEMS = 200;

@InputType({ description: 'Filtros de la SeudoBase (SB-01)' })
export class ProductionSeudoBaseFilters {
  @Field(() => [ProductionItemKind], { nullable: true })
  @IsOptional()
  @IsArray()
  @IsEnum(ProductionItemKind, { each: true })
  kinds?: ProductionItemKind[];

  @Field(() => ID, { nullable: true, description: 'Sólo el contenido de esta carpeta' })
  @IsOptional()
  @IsMongoId()
  parentId?: string;

  @Field(() => String, { nullable: true, description: 'Busca por título o ID' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  searchTerm?: string;
}

@InputType({ isAbstract: true })
abstract class ProductionBulkBaseInput {
  @Field(() => ID)
  @IsMongoId()
  productionId: string;

  @Field(() => [ID])
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(SEUDOBASE_MAX_ITEMS)
  @IsMongoId({ each: true })
  itemIds: string[];

  @Field(() => Boolean, {
    description:
      'Confirmación explícita de la operación masiva (SB-02/03). Tiene que ser true',
  })
  @IsBoolean()
  confirm: boolean;
}

@InputType({ description: 'Edición masiva de precio (ej. +5%)' })
export class ProductionBulkPriceInput extends ProductionBulkBaseInput {
  @Field(() => ProductionPriceChangeMode)
  @IsEnum(ProductionPriceChangeMode)
  mode: ProductionPriceChangeMode;

  @Field(() => Float, {
    description: 'percentage: porcentaje a sumar (negativo para bajar); fixed: precio nuevo',
  })
  @IsNumber()
  value: number;
}

@InputType({ description: 'Cambio masivo de visibilidad' })
export class ProductionBulkVisibilityInput extends ProductionBulkBaseInput {
  @Field(() => Visibility, {
    nullable: true,
    description: 'Vacío = los ítems vuelven a heredar del padre',
  })
  @IsOptional()
  @IsEnum(Visibility)
  visibility?: Visibility | null;
}

@InputType({ description: 'Borrado masivo (hard delete, libera cupo)' })
export class ProductionBulkDeleteInput extends ProductionBulkBaseInput {}
