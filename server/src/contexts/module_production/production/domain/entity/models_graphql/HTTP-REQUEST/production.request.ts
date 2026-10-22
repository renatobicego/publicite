import { Field, Float, ID, InputType } from '@nestjs/graphql';
import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsBoolean,
  IsEnum,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
  ValidateNested,
} from 'class-validator';

import {
  ProductionBehaviourType,
  ProductionShelfCategory,
  ProductionVisibility,
} from '../../enum/production.enums';

@InputType({
  description:
    'Ubicación y radio de alcance de un blog libre (igual que en Anuncios)',
})
export class ProductionGeoLocationInput {
  @Field(() => Float)
  @IsNumber()
  latitude: number;

  @Field(() => Float)
  @IsNumber()
  longitude: number;

  @Field(() => String, { nullable: true, description: 'Dirección legible' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @Field(() => Boolean, {
    nullable: true,
    description: 'Si el usuario eligió la ubicación a mano',
  })
  @IsOptional()
  @IsBoolean()
  userSetted?: boolean;

  @Field(() => Float, { description: 'Radio de alcance en metros (1000 a 200000)' })
  @IsNumber()
  ratio: number;
}

@InputType()
export class ProductionShelfLinkInput {
  @Field(() => ProductionShelfCategory)
  @IsEnum(ProductionShelfCategory)
  category: ProductionShelfCategory;

  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  title: string;

  @Field(() => String, { description: 'Link externo (http/https)' })
  @IsUrl({ require_protocol: true }, { message: 'link debe ser una URL válida' })
  @MaxLength(1000)
  link: string;

  @Field(() => String, { nullable: true, description: 'Key de UploadThing' })
  @IsOptional()
  @IsString()
  @MaxLength(300)
  imageKey?: string;
}

@InputType({ description: 'Alta de una producción / blog (BLG-01)' })
export class ProductionCreateRequest {
  @Field(() => String, { description: 'Nombre del blog (obligatorio)' })
  @IsString()
  @IsNotEmpty({ message: 'El nombre del blog es obligatorio' })
  @MaxLength(120)
  title: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @Field(() => String, { nullable: true, description: 'Key de UploadThing' })
  @IsOptional()
  @IsString()
  @MaxLength(300)
  headerPhotoKey?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  welcomeText?: string;

  @Field(() => String, { nullable: true, description: 'Key de UploadThing' })
  @IsOptional()
  @IsString()
  @MaxLength(300)
  welcomeVideoKey?: string;

  @Field(() => [ProductionShelfLinkInput], { nullable: true })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(200)
  @ValidateNested({ each: true })
  @Type(() => ProductionShelfLinkInput)
  shelf?: ProductionShelfLinkInput[];

  @Field(() => ProductionVisibility, {
    nullable: true,
    description: 'Alcance por defecto del blog (VIS-01). Default: public',
  })
  @IsOptional()
  @IsEnum(ProductionVisibility)
  visibility?: ProductionVisibility;

  @Field(() => ProductionBehaviourType, {
    nullable: true,
    description:
      'Sólo blogs personales: libre o agenda (como Anuncios). Default: libre. Se ignora en blogs de grupo',
  })
  @IsOptional()
  @IsEnum(ProductionBehaviourType)
  behaviourType?: ProductionBehaviourType;

  @Field(() => ProductionGeoLocationInput, {
    nullable: true,
    description: 'Obligatorio en blogs libres: ubicación y radio de alcance',
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => ProductionGeoLocationInput)
  geoLocation?: ProductionGeoLocationInput;

  @Field(() => ID, {
    nullable: true,
    description:
      'Si se informa, crea el blog del grupo (sólo el creator del grupo, GRP-02)',
  })
  @IsOptional()
  @IsMongoId()
  groupId?: string;
}

@InputType({ description: 'Edición del header, estantería y muestrario' })
export class ProductionUpdateRequest {
  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: 'El nombre del blog no puede quedar vacío' })
  @MaxLength(120)
  title?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(300)
  headerPhotoKey?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  welcomeText?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(300)
  welcomeVideoKey?: string;

  @Field(() => [ProductionShelfLinkInput], { nullable: true })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(200)
  @ValidateNested({ each: true })
  @Type(() => ProductionShelfLinkInput)
  shelf?: ProductionShelfLinkInput[];

  @Field(() => ProductionGeoLocationInput, {
    nullable: true,
    description: 'Ubicación y radio de un blog libre',
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => ProductionGeoLocationInput)
  geoLocation?: ProductionGeoLocationInput;

  @Field(() => [ID], {
    nullable: true,
    description: 'Muestrario: archivos o artículos destacados del blog (BLG-04)',
  })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(50)
  @IsMongoId({ each: true })
  showcase?: string[];
}
