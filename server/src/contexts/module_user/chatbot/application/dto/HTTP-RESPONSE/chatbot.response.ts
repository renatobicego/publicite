import { Field, ObjectType } from '@nestjs/graphql';
import { ChatbotAction } from '../../../domain/entity/enum/chatbot.action.enum';
import { ChatbotTokenStatusResponse } from './chatbot.token.response';

@ObjectType()
export class ChatMessageResponse {
  @Field(() => String)
  role: string;

  @Field(() => String)
  content: string;

  @Field(() => Date)
  timestamp: Date;

  @Field(() => ChatbotAction, { nullable: true })
  action?: ChatbotAction;
}

@ObjectType()
export class ChatSessionResponse {
  @Field(() => String)
  sessionId: string;

  @Field(() => String, { nullable: true })
  userId?: string;

  @Field(() => [ChatMessageResponse])
  messages: ChatMessageResponse[];

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  updatedAt: Date;

  @Field(() => Boolean)
  isActive: boolean;
}

@ObjectType()
export class SendMessageResponse {
  @Field(() => String)
  sessionId: string;

  @Field(() => String)
  userMessage: string;

  @Field(() => String)
  botResponse: string;

  @Field(() => Date)
  timestamp: Date;

  @Field(() => ChatbotAction, { nullable: true })
  action?: ChatbotAction;

  @Field(() => Boolean, {
    nullable: true,
    description:
      'true si el mensaje fue rechazado por falta de tokens de IA (botResponse trae el aviso)',
  })
  limitReached?: boolean;

  @Field(() => ChatbotTokenStatusResponse, {
    nullable: true,
    description: 'Estado de tokens Publicité de quien consulta, tras procesar el mensaje',
  })
  tokenStatus?: ChatbotTokenStatusResponse;
}

@ObjectType()
export class GenerateAdImageResponse {
  @Field(() => String, {
    description: 'Imagen generada como data URL en base64 (data:image/png;base64,...)',
  })
  imageBase64: string;
}

@ObjectType()
export class GetSessionHistoryResponse {
  @Field(() => String)
  sessionId: string;

  @Field(() => [ChatMessageResponse])
  messages: ChatMessageResponse[];

  @Field(() => Number)
  totalMessages: number;
}

@ObjectType()
export class ChatSessionSummary {
  @Field(() => String)
  sessionId: string;

  @Field(() => String)
  title: string;

  @Field(() => String, { nullable: true })
  lastMessage?: string;

  @Field(() => Date)
  lastMessageAt: Date;

  @Field(() => Number)
  messageCount: number;

  @Field(() => Date)
  createdAt: Date;
}

@ObjectType()
export class GetUserChatSessionsResponse {
  @Field(() => [ChatSessionSummary])
  sessions: ChatSessionSummary[];

  @Field(() => Number)
  totalCount: number;

  @Field(() => Boolean)
  hasMore: boolean;
}
