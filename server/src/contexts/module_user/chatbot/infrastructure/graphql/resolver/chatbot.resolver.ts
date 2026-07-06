import { Inject, UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver, Context } from '@nestjs/graphql';
import { ChatbotAdapterInterface } from '../../../application/adapter/chatbot.adapter.interface';
import { ClerkAuthGuard } from 'src/contexts/module_shared/auth/clerk-auth/clerk.auth.guard';
import { CustomContextRequestInterface } from 'src/contexts/module_shared/auth/custom_request/custom.context.request.interface';
import { SendMessageRequest } from '../../../application/dto/HTTP-REQUEST/send.message.request';
import { CreateSessionRequest } from '../../../application/dto/HTTP-REQUEST/create.session.request';
import { GenerateAdImageRequest } from '../../../application/dto/HTTP-REQUEST/generate.ad.image.request';
import {
  ChatSessionResponse,
  SendMessageResponse,
  GetSessionHistoryResponse,
  GetUserChatSessionsResponse,
  GenerateAdImageResponse,
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
      // El userId (mongoId) llega en el request desde el server action del front
      // (mismo criterio que getUserChatSessions). Si en el futuro se envía el token
      // de Clerk y un guard resuelve el usuario, lo preferimos por ser más confiable.
      const userRequestId = context?.req?.userRequestId;
      if (userRequestId) {
        sendMessageRequest.userId = userRequestId;
      }
      // Importante: NO forzamos sessionId = userId. Cada conversación tiene su propio
      // sessionId; si viene vacío, el service genera uno nuevo (conversación nueva).

      return await this.chatbotAdapter.sendMessage(sendMessageRequest);
    } catch (error: any) {
      throw error;
    }
  }

  @Mutation(() => GenerateAdImageResponse, {
    nullable: false,
    description:
      'Genera una imagen para un anuncio a partir de un prompt usando IA (OpenAI)',
  })
  async generateAdImage(
    @Args('generateAdImageRequest', { type: () => GenerateAdImageRequest })
    generateAdImageRequest: GenerateAdImageRequest,
    @Context() context?: { req: CustomContextRequestInterface },
  ): Promise<GenerateAdImageResponse> {
    try {
      const userRequestId = context?.req?.userRequestId;
      const imageBase64 = await this.chatbotAdapter.generateAdImage(
        generateAdImageRequest.prompt,
        userRequestId,
      );
      return { imageBase64 };
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

  @Query(() => GetUserChatSessionsResponse, {
    nullable: false,
    description: 'Obtener todas las sesiones de chat de un usuario',
  })
  async getUserChatSessions(
    @Args('userId', { type: () => String }) userId: string,
    @Args('limit', { type: () => Number, nullable: true }) limit?: number,
    @Args('page', { type: () => Number, nullable: true }) page?: number,
  ): Promise<GetUserChatSessionsResponse> {
    try {
      return await this.chatbotAdapter.getUserChatSessions(userId, limit, page);
    } catch (error: any) {
      throw error;
    }
  }
}

