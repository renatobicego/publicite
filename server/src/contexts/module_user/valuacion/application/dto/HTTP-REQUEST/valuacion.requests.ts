import { Field, InputType } from '@nestjs/graphql';
import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { ValuacionCategory } from '../../../domain/entity/enum/valuacion.enums';

@InputType()
export class StartValuacionRequest {
  @Field(() => ValuacionCategory, {
    description: 'imagen | objeto | servicio | bien | otro',
  })
  @IsEnum(ValuacionCategory)
  category: ValuacionCategory;

  @Field(() => [String], {
    nullable: true,
    description: 'URLs de imágenes ya subidas (sólo hosts de Publicité)',
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  imageUrls?: string[];

  @Field(() => String, {
    nullable: true,
    description: 'Descripción libre inicial de lo que se quiere valuar',
  })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @Field(() => String, {
    nullable: true,
    description: 'Modo de Cubito (general, marketing, analista_mercado, ...)',
  })
  @IsOptional()
  @IsString()
  mode?: string;

  @Field(() => String, {
    nullable: true,
    description: 'sessionId del chat del workspace, para correlacionar la conversación',
  })
  @IsOptional()
  @IsString()
  sessionId?: string;
}

@InputType()
export class ValuacionMessageRequest {
  @Field(() => String)
  @IsNotEmpty()
  @IsString()
  valuacionId: string;

  @Field(() => String)
  @IsNotEmpty()
  @IsString()
  @MaxLength(2000)
  message: string;

  @Field(() => [String], {
    nullable: true,
    description: 'Imágenes adicionales que se suman a la valuación',
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  imageUrls?: string[];
}
