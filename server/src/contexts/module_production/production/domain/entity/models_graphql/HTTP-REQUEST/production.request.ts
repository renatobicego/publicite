import { Field, ID, InputType } from '@nestjs/graphql';
import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsEnum,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
  ValidateNested,
} from 'class-validator';

import { ProductionShelfCategory } from '../../enum/production.enums';
import { Visibility } from 'src/contexts/module_post/post/domain/entity/enum/post-visibility.enum';

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

  @Field(() => Visibility, {
    nullable: true,
    description: 'Alcance por defecto del blog (VIS-01). Default: public',
  })
  @IsOptional()
  @IsEnum(Visibility)
  visibility?: Visibility;

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
