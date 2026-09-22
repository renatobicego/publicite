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

import { PostType } from '../../enum/post-type.enum';
import { Visibility } from '../../enum/post-visibility.enum';
import { PostPriceChangeMode } from '../../enum/post-seudobase.enums';

/** Tope de anuncios afectados por una operación masiva. */
export const POST_SEUDOBASE_MAX_ITEMS = 200;

@InputType({ description: 'Filtros de la SeudoBase de Anuncios (SB-01)' })
export class PostSeudoBaseFilters {
  @Field(() => [PostType], {
    nullable: true,
    description: 'Filtrar por tipo de anuncio (good/service/petition)',
  })
  @IsOptional()
  @IsArray()
  @IsEnum(PostType, { each: true })
  postTypes?: PostType[];

  @Field(() => Boolean, {
    nullable: true,
    description: 'Filtrar por disponibilidad (isActive)',
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @Field(() => String, {
    nullable: true,
    description: 'Busca por título',
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  searchTerm?: string;
}

@InputType({ isAbstract: true })
abstract class PostBulkBaseInput {
  @Field(() => [ID], { description: 'Anuncios a modificar (propios)' })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(POST_SEUDOBASE_MAX_ITEMS)
  @IsMongoId({ each: true })
  postIds: string[];

  @Field(() => Boolean, {
    description:
      'Confirmación explícita de la operación masiva (SB-02/03). Tiene que ser true',
  })
  @IsBoolean()
  confirm: boolean;
}

@InputType({ description: 'Edición masiva de precio de anuncios (ej. +5%)' })
export class PostBulkPriceInput extends PostBulkBaseInput {
  @Field(() => PostPriceChangeMode)
  @IsEnum(PostPriceChangeMode)
  mode: PostPriceChangeMode;

  @Field(() => Float, {
    description:
      'percentage: porcentaje a sumar (negativo para bajar); fixed: precio nuevo',
  })
  @IsNumber()
  value: number;
}

@InputType({ description: 'Cambio masivo de visibilidad de anuncios' })
export class PostBulkVisibilityInput extends PostBulkBaseInput {
  @Field(() => Visibility)
  @IsEnum(Visibility)
  visibility: Visibility;
}

@InputType({ description: 'Borrado masivo de anuncios (hard delete en cascada)' })
export class PostBulkDeleteInput extends PostBulkBaseInput {}
