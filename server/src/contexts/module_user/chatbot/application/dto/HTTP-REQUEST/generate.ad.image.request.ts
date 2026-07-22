import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

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
}
