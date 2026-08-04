import { Field, InputType } from '@nestjs/graphql';
import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsArray,
  MaxLength,
} from 'class-validator';

@InputType()
export class SendMessageRequest {
  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  sessionId?: string;

  @Field(() => String)
  @IsNotEmpty()
  @IsString()
  message: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  userId?: string;

  @Field(() => String, {
    nullable: true,
    description:
      'Modo/especialidad de Cubito: general | disenador_grafico | marketing | ' +
      'especialista_negocios | branch | cliente_b2b | consultor_ventas | ' +
      'analista_mercado | entrenamiento_publicitario',
  })
  @IsOptional()
  @IsString()
  mode?: string;

  @Field(() => String, {
    nullable: true,
    description:
      'Prompt libre de rol ("respondé como si fueras..."). Se suma como contexto de estilo.',
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  rolePrompt?: string;

  @Field(() => String, {
    nullable: true,
    description:
      'Prompt sugerido que se suma al prompt fijo del modo (Entrenamiento Publicitario).',
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  extraPrompt?: string;

  @Field(() => [String], {
    nullable: true,
    description: 'Imágenes para que Cubito analice (sólo hosts de Publicité)',
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  imageUrls?: string[];
}

