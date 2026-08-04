import { Field, Float, InputType, Int, ObjectType } from '@nestjs/graphql';
import {
  IsArray,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { ChatbotTokenStatusResponse } from 'src/contexts/module_user/chatbot/application/dto/HTTP-RESPONSE/chatbot.token.response';

@InputType()
export class SearchMatchRequest {
  @Field(() => String, {
    nullable: true,
    description: 'Texto libre: una necesidad, un producto, un servicio',
  })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  text?: string;

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
    description: 'Id de un anuncio existente para buscar similares',
  })
  @IsOptional()
  @IsString()
  postId?: string;

  @Field(() => String, {
    nullable: true,
    description: 'Modo de Cubito aplicado a la búsqueda',
  })
  @IsOptional()
  @IsString()
  mode?: string;

  @Field(() => String, {
    nullable: true,
    description: 'sessionId del workspace, para el tracking de tokens',
  })
  @IsOptional()
  @IsString()
  sessionId?: string;
}

@ObjectType()
export class MatchedPostResponse {
  @Field(() => String) postId: string;
  @Field(() => String) title: string;
  @Field(() => String, { nullable: true }) description?: string;
  @Field(() => Float, { nullable: true }) price?: number;
  @Field(() => String, { nullable: true }) imageUrl?: string | null;
  @Field(() => String, { nullable: true }) postType?: string;

  @Field(() => Int, { description: 'Relevancia 0-100 asignada por la IA' })
  relevanceScore: number;

  @Field(() => String, { description: 'Explicación de por qué coincide' })
  matchReason: string;
}

@ObjectType()
export class MatchResponse {
  @Field(() => [MatchedPostResponse])
  matches: MatchedPostResponse[];

  @Field(() => String, {
    nullable: true,
    description: 'Interpretación de la IA sobre lo que busca el usuario',
  })
  interpretation?: string;

  @Field(() => Int, {
    description: 'Cantidad de anuncios evaluados antes del ranking',
  })
  candidatesEvaluated: number;

  @Field(() => ChatbotTokenStatusResponse, {
    nullable: true,
    description: 'Estado de tokens luego de la búsqueda',
  })
  tokenStatus?: ChatbotTokenStatusResponse;

  @Field(() => Boolean, {
    nullable: true,
    description: 'true si la búsqueda se bloqueó por falta de tokens',
  })
  limitReached?: boolean;

  @Field(() => String, {
    nullable: true,
    description: 'Mensaje para mostrar cuando no hay resultados o se bloqueó',
  })
  message?: string;
}
