import { Field, Float, Int, ObjectType } from '@nestjs/graphql';
import { ChatbotTokenStatusResponse } from 'src/contexts/module_user/chatbot/application/dto/HTTP-RESPONSE/chatbot.token.response';

@ObjectType()
export class PhotoScoresResponse {
  @Field(() => Int) estado: number;
  @Field(() => Int) marca: number;
  @Field(() => Int) mercado: number;
  @Field(() => Int) rareza: number;
}

@ObjectType()
export class DescriptiveScoresResponse {
  @Field(() => Int) uso: number;
  @Field(() => Int) vidaUtil: number;
  @Field(() => Int) mantenimiento: number;
  @Field(() => Int) documentacion: number;
}

@ObjectType()
export class PhotoAnalysisResponse {
  @Field(() => String) description: string;
  @Field(() => String, { nullable: true }) brand?: string | null;
  @Field(() => String, { nullable: true }) model?: string | null;
  @Field(() => String) condition: string;
  @Field(() => [String]) components: string[];
  @Field(() => [String]) damages: string[];
  @Field(() => PhotoScoresResponse) scores: PhotoScoresResponse;
  @Field(() => Int, { description: 'Confianza del análisis fotográfico (0-100)' })
  confidence: number;
}

@ObjectType()
export class DescriptiveAnalysisResponse {
  @Field(() => String) summary: string;
  @Field(() => DescriptiveScoresResponse) scores: DescriptiveScoresResponse;
  @Field(() => Int, { description: 'Confianza del análisis descriptivo (0-100)' })
  confidence: number;
}

@ObjectType()
export class EstimatedValuesResponse {
  @Field(() => Float, { nullable: true }) liquidacion?: number | null;
  @Field(() => Float, { nullable: true }) mercado?: number | null;
  @Field(() => Float, { nullable: true }) premium?: number | null;
  @Field(() => String) currency: string;
}

@ObjectType()
export class ValuacionDataSourceResponse {
  @Field(() => String) field: string;
  @Field(() => String, {
    description: 'fotografica | descriptiva | inferencia_ia',
  })
  source: string;
}

@ObjectType()
export class ValuacionImageResponse {
  @Field(() => String) url: string;
  @Field(() => Date) uploadedAt: Date;
  @Field(() => String, { nullable: true }) analysisNotes?: string;
}

@ObjectType()
export class ValuacionBriefMessageResponse {
  @Field(() => String) role: string;
  @Field(() => String) content: string;
  @Field(() => Date) timestamp: Date;
}

@ObjectType()
export class ValuacionResponse {
  @Field(() => String) id: string;
  @Field(() => String) userId: string;
  @Field(() => String, { nullable: true }) sessionId?: string;
  @Field(() => String, { nullable: true }) postId?: string | null;

  @Field(() => String, { description: 'imagen | objeto | servicio | bien | otro' })
  category: string;

  @Field(() => String, {
    description: 'draft | processing | completed | saved | archived',
  })
  status: string;

  @Field(() => String, { nullable: true }) mode?: string;

  @Field(() => Int, { description: 'Capa de valuación alcanzada (1, 2 o 3)' })
  layer: number;

  @Field(() => Int, { description: 'Completitud del brief (0-100), calculada por el backend' })
  completionPercent: number;

  @Field(() => Int, { description: 'Confianza IA (0-100), acotada por la capa' })
  confidencePercent: number;

  @Field(() => [String], { description: 'Ejes del brief ya cubiertos' })
  coveredFields: string[];

  @Field(() => [ValuacionBriefMessageResponse])
  briefMessages: ValuacionBriefMessageResponse[];

  @Field(() => [ValuacionImageResponse])
  images: ValuacionImageResponse[];

  @Field(() => PhotoAnalysisResponse, { nullable: true })
  photoAnalysis?: PhotoAnalysisResponse | null;

  @Field(() => DescriptiveAnalysisResponse, { nullable: true })
  descriptiveAnalysis?: DescriptiveAnalysisResponse | null;

  @Field(() => EstimatedValuesResponse, { nullable: true })
  estimatedValues?: EstimatedValuesResponse | null;

  @Field(() => Float, {
    nullable: true,
    description: 'Puntuación final: promedio de los 8 ejes del círculo de valoración',
  })
  finalScore?: number | null;

  @Field(() => [ValuacionDataSourceResponse])
  dataSources: ValuacionDataSourceResponse[];

  @Field(() => Int, { description: 'Cantidad de versiones anteriores del resultado' })
  versionsCount: number;

  @Field(() => Date, { nullable: true }) createdAt?: Date;
  @Field(() => Date, { nullable: true }) updatedAt?: Date;

  @Field(() => ChatbotTokenStatusResponse, {
    nullable: true,
    description: 'Estado de tokens luego de esta operación (para el indicador del front)',
  })
  tokenStatus?: ChatbotTokenStatusResponse;
}

/** Respuesta de un turno del brief: el mensaje de Cubito + la valuación actualizada. */
@ObjectType()
export class ValuacionMessageResponse {
  @Field(() => String, { description: 'Mensaje de Cubito para mostrar en el chat' })
  reply: string;

  @Field(() => Boolean, {
    description: 'true cuando ya se puede generar el resultado final',
  })
  briefComplete: boolean;

  @Field(() => ValuacionResponse)
  valuacion: ValuacionResponse;

  @Field(() => Boolean, {
    nullable: true,
    description: 'true si la operación se bloqueó por falta de tokens',
  })
  limitReached?: boolean;
}

@ObjectType()
export class ValuacionListResponse {
  @Field(() => [ValuacionResponse]) valuaciones: ValuacionResponse[];
  @Field(() => Int) total: number;
  @Field(() => Boolean) hasMore: boolean;
}

/** Payload para pre-cargar el wizard de creación de anuncio desde una valuación. */
@ObjectType()
export class ValuacionToPostDraftResponse {
  @Field(() => String) title: string;
  @Field(() => String) description: string;
  @Field(() => Float, { nullable: true, description: 'Precio sugerido (valor de mercado)' })
  suggestedPrice?: number | null;
  @Field(() => [String]) imageUrls: string[];
  @Field(() => String, { nullable: true }) brand?: string | null;
  @Field(() => String, { nullable: true }) modelType?: string | null;
  @Field(() => String, { nullable: true }) condition?: string | null;
  @Field(() => String) valuacionId: string;
}
