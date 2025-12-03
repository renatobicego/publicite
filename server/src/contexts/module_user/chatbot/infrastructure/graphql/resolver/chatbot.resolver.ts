import { Inject, UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver, Context } from '@nestjs/graphql';
import { ChatbotAdapterInterface } from '../../../application/adapter/chatbot.adapter.interface';
import { ClerkAuthGuard } from 'src/contexts/module_shared/auth/clerk-auth/clerk.auth.guard';
import { CustomContextRequestInterface } from 'src/contexts/module_shared/auth/custom_request/custom.context.request.interface';
import { SendMessageRequest } from '../../../application/dto/HTTP-REQUEST/send.message.request';
import { CreateSessionRequest } from '../../../application/dto/HTTP-REQUEST/create.session.request';
import {
  ChatSessionResponse,
  SendMessageResponse,
  GetSessionHistoryResponse,
} from '../../../application/dto/HTTP-RESPONSE/chatbot.response';

@Resolver()
export class ChatbotResolver {
  constructor(
    @Inject('ChatbotAdapterInterface')
    private readonly chatbotAdapter: ChatbotAdapterInterface,
  ) {}

  @Mutation(() => ChatSessionResponse, {
    nullable: false,
    description: 'Crear una nueva sesión de chat',
  })
  async createChatSession(
    @Args('createSessionRequest', {
      type: () => CreateSessionRequest,
      nullable: true,
    })
    createSessionRequest?: CreateSessionRequest,
    @Context() context?: { req: CustomContextRequestInterface },
  ): Promise<ChatSessionResponse> {
    try {
      const userId =
        createSessionRequest?.userId || context?.req?.userRequestId;
      return await this.chatbotAdapter.createSession(userId);
    } catch (error: any) {
      throw error;
    }
  }

  @Mutation(() => SendMessageResponse, {
    nullable: false,
    description:
      'Enviar un mensaje al chatbot (crea la sesión automáticamente)',
  })
  async sendMessageToChatbot(
    @Args('sendMessageRequest', { type: () => SendMessageRequest })
    sendMessageRequest: SendMessageRequest,
    @Context() context?: { req: CustomContextRequestInterface },
  ): Promise<SendMessageResponse> {
    try {
      const userRequestId = context?.req?.userRequestId;

      if (userRequestId) {
        sendMessageRequest.sessionId = userRequestId;
        sendMessageRequest.userId = userRequestId;
      } else if (!sendMessageRequest.sessionId) {
        sendMessageRequest.sessionId = undefined;
      }

      return await this.chatbotAdapter.sendMessage(sendMessageRequest);
    } catch (error: any) {
      throw error;
    }
  }

  @Query(() => GetSessionHistoryResponse, {
    nullable: false,
    description: 'Obtener el historial de una sesión de chat',
  })
  async getChatSessionHistory(
    @Args('sessionId', { type: () => String }) sessionId: string,
    @Args('limit', { type: () => Number, nullable: true }) limit?: number,
    @Args('page', { type: () => Number, nullable: true }) page?: number,
  ): Promise<GetSessionHistoryResponse> {
    try {
      return await this.chatbotAdapter.getSessionHistory(
        sessionId,
        limit,
        page,
      );
    } catch (error: any) {
      throw error;
    }
  }

  @Mutation(() => Boolean, {
    nullable: false,
    description:
      'Eliminar una sesión de chat completa (sesión + todos los mensajes)',
  })
  async deleteChatSession(
    @Args('sessionId', { type: () => String }) sessionId: string,
  ): Promise<boolean> {
    try {
      return await this.chatbotAdapter.deleteSession(sessionId);
    } catch (error: any) {
      throw error;
    }
  }
}

