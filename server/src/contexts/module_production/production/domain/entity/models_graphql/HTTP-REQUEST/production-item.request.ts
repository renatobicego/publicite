import { Field, Float, ID, InputType } from '@nestjs/graphql';
import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsEnum,
  IsLatitude,
  IsLongitude,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  ValidateNested,
} from 'class-validator';

import { ProductionFileType } from '../../enum/production.enums';
import { Visibility } from 'src/contexts/module_post/post/domain/entity/enum/post-visibility.enum';

@InputType({ description: 'Dorso de la postal (BLG-08)' })
export class ProductionPostcardInput {
  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsLatitude()
  latitude?: number;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsLongitude()
  longitude?: number;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  authorship?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  dedication?: string;

  @Field(() => String, {
    nullable: true,
    description: 'Descripción guiada ("¿Qué sentiste este día?")',
  })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;
}

@InputType({ description: 'Bloque de Editor.js; data es el JSON stringificado' })
export class ProductionArticleBlockInput {
  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  type: string;

  @Field(() => String)
  @IsString()
  @MaxLength(100000)
  data: string;
}

@InputType()
export class ProductionFolderRequest {
  @Field(() => ID)
  @IsMongoId()
  productionId: string;

  @Field(() => ID, { nullable: true, description: 'Carpeta padre; vacío = raíz' })
  @IsOptional()
  @IsMongoId()
  parentId?: string;

  @Field(() => String)
  @IsString()
  @IsNotEmpty({ message: 'El nombre de la carpeta es obligatorio' })
  @MaxLength(120)
  name: string;

  @Field(() => Visibility, {
    nullable: true,
    description: 'Alcance propio; vacío = hereda del padre (VIS-03/04)',
  })
  @IsOptional()
  @IsEnum(Visibility)
  visibility?: Visibility;
}

@InputType()
export class ProductionFolderUpdateRequest {
  @Field(() => String)
  @IsString()
  @IsNotEmpty({ message: 'El nombre de la carpeta es obligatorio' })
  @MaxLength(120)
  name: string;
}

@InputType({ description: 'Archivo ya subido a UploadThing (BLG-08..12)' })
export class ProductionFileRequest {
  @Field(() => ID)
  @IsMongoId()
  productionId: string;

  @Field(() => ID, { nullable: true, description: 'Carpeta; vacío = raíz' })
  @IsOptional()
  @IsMongoId()
  parentId?: string;

  @Field(() => ProductionFileType)
  @IsEnum(ProductionFileType)
  fileType: ProductionFileType;

  @Field(() => String, { description: 'Key de UploadThing' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(300)
  key: string;

  @Field(() => String, {
    nullable: true,
    description:
      'ID editable del archivo, único en su carpeta (BLG-13). Si se omite se genera',
  })
  @IsOptional()
  @IsString()
  @MaxLength(80)
  fileName?: string;

  @Field(() => String, { nullable: true, description: 'Título visible' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  name?: string;

  @Field(() => ProductionPostcardInput, { nullable: true })
  @IsOptional()
  @ValidateNested()
  @Type(() => ProductionPostcardInput)
  postcard?: ProductionPostcardInput;

  @Field(() => Visibility, { nullable: true })
  @IsOptional()
  @IsEnum(Visibility)
  visibility?: Visibility;
}

@InputType()
export class ProductionFileUpdateRequest {
  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(80)
  fileName?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  name?: string;

  @Field(() => ProductionPostcardInput, { nullable: true })
  @IsOptional()
  @ValidateNested()
  @Type(() => ProductionPostcardInput)
  postcard?: ProductionPostcardInput;
}

@InputType({ description: 'Artículo de blog con editor de bloques (BLG-14..17)' })
export class ProductionArticleRequest {
  @Field(() => ID)
  @IsMongoId()
  productionId: string;

  @Field(() => ID, { nullable: true, description: 'Carpeta; vacío = raíz' })
  @IsOptional()
  @IsMongoId()
  parentId?: string;

  @Field(() => String)
  @IsString()
  @IsNotEmpty({ message: 'El título del artículo es obligatorio' })
  @MaxLength(200)
  title: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(80)
  fileName?: string;

  @Field(() => [ProductionArticleBlockInput])
  @IsArray()
  @ArrayMaxSize(500)
  @ValidateNested({ each: true })
  @Type(() => ProductionArticleBlockInput)
  blocks: ProductionArticleBlockInput[];

  @Field(() => Visibility, { nullable: true })
  @IsOptional()
  @IsEnum(Visibility)
  visibility?: Visibility;
}

@InputType()
export class ProductionArticleUpdateRequest {
  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  title?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(80)
  fileName?: string;

  @Field(() => [ProductionArticleBlockInput], { nullable: true })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(500)
  @ValidateNested({ each: true })
  @Type(() => ProductionArticleBlockInput)
  blocks?: ProductionArticleBlockInput[];
}
