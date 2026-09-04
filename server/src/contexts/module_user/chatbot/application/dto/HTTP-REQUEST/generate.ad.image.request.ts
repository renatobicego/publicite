import { Field, InputType } from '@nestjs/graphql';
import {
  ArrayMaxSize,
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

@InputType()
export class GenerateAdImageRequest {
  @Field(() => String)
  @IsNotEmpty()
  @IsString()
  @MaxLength(200, {
    message: 'El prompt no puede superar los 200 caracteres',
  })
  prompt: string;

  @Field(() => String, {
    nullable: true,
    description:
      'mongoId del usuario (fallback si no viene token de Clerk; la generación de imágenes requiere usuario registrado)',
  })
  @IsOptional()
  @IsString()
  userId?: string;

  @Field(() => [String], {
    nullable: true,
    description:
      'Imágenes de referencia (data URLs base64) para generar de forma contextual: ' +
      'la nueva imagen se edita a partir de estas en vez de crearse desde cero. ' +
      'Se usa para follow-ups tipo "el mismo perro pero ahora con su dueño".',
  })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(4, {
    message: 'No se pueden enviar más de 4 imágenes de referencia',
  })
  @IsString({ each: true })
  referenceImages?: string[];
}
