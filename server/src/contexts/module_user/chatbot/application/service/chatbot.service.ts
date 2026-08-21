import { Inject, Injectable } from '@nestjs/common';
import { ChatbotServiceInterface } from '../../domain/service/chatbot.service.interface';
import { ChatbotRepositoryInterface } from '../../domain/repository/chatbot.repository.interface';
import { ChatbotAIServiceInterface } from '../../domain/service/chatbot.ai.service.interface';
import { ChatbotTokenServiceInterface } from '../../domain/service/chatbot.token.service.interface';
import { AvatarServiceInterface } from '../../domain/service/avatar.service.interface';
import {
  AiUsage,
  AiUsageKind,
  TokenBlockedReason,
  TokenConsumerBucket,
  TokenGateResult,
} from '../../domain/entity/chatbot.token.types';
import { ChatSession } from '../../domain/entity/chat.session.entity';
import { ChatMessage } from '../../domain/entity/chat.message.entity';
import { MessageRole } from '../../domain/entity/enum/message.role.enum';
import { SendMessageRequest } from '../dto/HTTP-REQUEST/send.message.request';
import {
  ChatSessionResponse,
  SendMessageResponse,
  GetSessionHistoryResponse,
  GetUserChatSessionsResponse,
  ChatMessageResponse,
} from '../dto/HTTP-RESPONSE/chatbot.response';
import { ChatbotTokenStatusResponse } from '../dto/HTTP-RESPONSE/chatbot.token.response';
import {
  getImageFallbackPubliciteTokens,
  publiciteToRealTokens,
} from 'src/contexts/module_shared/chatbot-tokens/chatbot.tokens.config';
import { MyLoggerService } from 'src/contexts/module_shared/logger/logger.service';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class ChatbotService implements ChatbotServiceInterface {
  constructor(
    @Inject('ChatbotRepositoryInterface')
    private readonly chatbotRepository: ChatbotRepositoryInterface,
    @Inject('ChatbotAIServiceInterface')
    private readonly chatbotAIService: ChatbotAIServiceInterface,
    @Inject('ChatbotTokenServiceInterface')
    private readonly chatbotTokenService: ChatbotTokenServiceInterface,
    @Inject('AvatarServiceInterface')
    private readonly avatarService: AvatarServiceInterface,
    private readonly logger: MyLoggerService,
  ) {}

  async createSession(userId?: string): Promise<ChatSessionResponse> {
    try {
      this.logger.log('Creating new chat session');
          
      const sessionId = userId || uuidv4();
      const now = new Date();
      
      const existingSession = await this.chatbotRepository.findSessionById(sessionId);
      
      if (existingSession) {
        this.logger.log('Session already exists, returning existing session');
        return this.mapSessionToResponse(existingSession);
      }
      
      const newSession = new ChatSession(
        sessionId,
        [],
        now,
        now,
        true,
        userId,
      );

      const savedSession = await this.chatbotRepository.createSession(newSession);
      
      return this.mapSessionToResponse(savedSession);
    } catch (error: any) {
      this.logger.error('Error creating chat session: ' + error.message);
      throw error;
    }
  }

  async sendMessage(request: SendMessageRequest): Promise<SendMessageResponse> {
    try {
      // Si no hay sessionId, generar uno nuevo (usuario no autenticado sin sessionId)
      const sessionId = request.sessionId || uuidv4();
      const userId = request.userId;

      this.logger.log(`Sending message to session: ${sessionId}`);

      // Gate de tokens de IA: sin saldo (propio o comunitario) no se llama a OpenAI.
      // La respuesta es un mensaje normal del bot con el aviso, así la web y
      // WhatsApp lo muestran sin manejo especial de errores.
      const tokenGate = await this.chatbotTokenService.resolveAndCheck(
        userId,
        sessionId,
      );
      if (!tokenGate.allowed) {
        this.logger.warn(
          `Chatbot bloqueado por tokens (${tokenGate.blockedReason}) para ${tokenGate.consumer.ownerType}:${tokenGate.consumer.ownerId}`,
        );
        return {
          sessionId,
          userMessage: request.message,
          botResponse: this.chatbotTokenService.buildLimitMessage(tokenGate),
          timestamp: new Date(),
          limitReached: true,
          tokenStatus: this.chatbotTokenService.buildStatusFromGate(tokenGate),
        };
      }

      let session = await this.chatbotRepository.findSessionById(sessionId);

      // Si no existe la sesión, crearla automáticamente asociada al usuario.
      // Guardar el userId (mongoId) es lo que permite que la conversación aparezca
      // luego en el historial (getUserChatSessions filtra por userId).
      if (!session) {
        this.logger.log('Session not found, creating new session automatically');
        const now = new Date();
        const newSession = new ChatSession(sessionId, [], now, now, true, userId);
        session = await this.chatbotRepository.createSession(newSession);
      }

      if (!session) {
        throw new Error('Failed to create or find session');
      }

      if (!session.getIsActive) {
        throw new Error('Session is not active');
      }

      const userMessage = new ChatMessage(
        MessageRole.USER,
        request.message,
        new Date(),
      );

      // Un avatar seleccionado manda sobre el rolePrompt libre: es una elección
      // explícita del usuario para esta conversación. Si el avatar no existe o
      // no es suyo, se ignora y el chat sigue con el rolePrompt que haya venido.
      const avatarContext = request.avatarId
        ? await this.avatarService.resolveContextForUser(
            request.avatarId,
            userId,
          )
        : undefined;

      const aiResult = await this.chatbotAIService.generateResponse(
        session.getMessages,
        request.message,
        {
          mode: request.mode,
          rolePrompt: request.rolePrompt,
          extraPrompt: request.extraPrompt,
          avatarContext,
          imageUrls: request.imageUrls,
        },
      );

      const botMessage = new ChatMessage(
        MessageRole.ASSISTANT,
        aiResult.content,
        new Date(),
        aiResult.action,
      );

      const updatedMessages = [
        ...session.getMessages,
        userMessage,
        botMessage,
      ];

      await this.chatbotRepository.updateSession(
        sessionId,
        updatedMessages,
      );

      const tokenStatus = await this.chargeUsage(tokenGate, aiResult.usage, {
        sessionId,
        kind: 'chat',
        model: aiResult.model ?? 'gpt-4o-mini',
      });

      return {
        sessionId: sessionId,
        userMessage: request.message,
        botResponse: aiResult.content,
        timestamp: new Date(),
        action: aiResult.action,
        tokenStatus,
      };
    } catch (error: any) {
      this.logger.error('Error sending message: ' + error.message);
      throw error;
    }
  }

  async getSessionHistory(
    sessionId: string,
    limit?: number,
    page?: number,
  ): Promise<GetSessionHistoryResponse> {
    try {
      this.logger.log(`Getting session history for: ${sessionId}`);

      const session = await this.chatbotRepository.findSessionById(sessionId);
      
      if (!session) {
        throw new Error('Session not found');
      }

      const messages = session.getMessages;
      const totalMessages = messages.length;

      let paginatedMessages = messages;
      if (limit && page) {
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        paginatedMessages = messages.slice(startIndex, endIndex);
      }

      return {
        sessionId: session.getSessionId,
        messages: paginatedMessages.map(msg => this.mapMessageToResponse(msg)),
        totalMessages,
      };
    } catch (error: any) {
      this.logger.error('Error getting session history: ' + error.message);
      throw error;
    }
  }

  async deleteSession(sessionId: string): Promise<boolean> {
    try {
      this.logger.log(`Deleting session: ${sessionId}`);
      return await this.chatbotRepository.deleteSession(sessionId);
    } catch (error: any) {
      this.logger.error('Error deleting session: ' + error.message);
      throw error;
    }
  }

  async getUserChatSessions(
    userId: string,
    limit: number = 20,
    page: number = 1,
  ): Promise<GetUserChatSessionsResponse> {
    try {
      this.logger.log(`Getting chat sessions for user: ${userId}`);

      const sessions = await this.chatbotRepository.findSessionsByUserId(
        userId,
        limit,
        page,
      );

      const sessionSummaries = sessions
        .filter((session) => session.getMessages.length > 0)
        .map((session) => {
          const messages = session.getMessages;
          const firstUserMessage = messages.find(
            (msg) => msg.getRole === 'user',
          );
          const lastMessage = messages[messages.length - 1];

          // Generar título a partir del primer mensaje del usuario
          const title = firstUserMessage
            ? firstUserMessage.getContent.length > 50
              ? firstUserMessage.getContent.substring(0, 50) + '...'
              : firstUserMessage.getContent
            : 'Conversación sin título';

          return {
            sessionId: session.getSessionId,
            title,
            lastMessage: lastMessage ? lastMessage.getContent.substring(0, 100) : undefined,
            lastMessageAt: session.getUpdatedAt,
            messageCount: messages.length,
            createdAt: session.getCreatedAt,
          };
        });

      // Para totalCount necesitamos saber cuántas sesiones tiene el usuario en total
      // Como findSessionsByUserId ya pagina, asumimos hasMore si devolvió exactamente limit
      const hasMore = sessions.length === limit;

      return {
        sessions: sessionSummaries,
        totalCount: sessionSummaries.length,
        hasMore,
      };
    } catch (error: any) {
      this.logger.error('Error getting user chat sessions: ' + error.message);
      throw error;
    }
  }

  async generateAdImage(prompt: string, userId?: string): Promise<string> {
    try {
      this.logger.log(`Generating ad image for user: ${userId ?? 'anon'}`);

      // Generar imágenes es caro: se exige identidad de usuario registrado
      // (los anónimos no son limitables de forma confiable) y saldo de tokens.
      const tokenGate = await this.chatbotTokenService.resolveAndCheck(
        userId,
        undefined,
      );
      if (tokenGate.consumer.bucket === TokenConsumerBucket.ANONYMOUS) {
        tokenGate.allowed = false;
        tokenGate.blockedReason = TokenBlockedReason.IDENTITY_REQUIRED;
      }
      if (!tokenGate.allowed) {
        throw new Error(this.chatbotTokenService.buildLimitMessage(tokenGate));
      }

      const result = await this.chatbotAIService.generateImage(prompt);

      // gpt-image puede no informar usage: en ese caso se cobra un costo fijo
      // configurable por env (CHATBOT_TOKENS_IMAGE_FALLBACK).
      const usage: AiUsage = result.usage ?? {
        promptTokens: 0,
        completionTokens: publiciteToRealTokens(getImageFallbackPubliciteTokens()),
        totalTokens: publiciteToRealTokens(getImageFallbackPubliciteTokens()),
      };
      await this.chargeUsage(tokenGate, usage, {
        kind: 'image',
        model: result.model ?? 'gpt-image-1-mini',
      });

      return result.imageBase64;
    } catch (error: any) {
      this.logger.error('Error generating ad image: ' + error.message);
      throw error;
    }
  }

  async getTokenStatusForUser(
    userId: string,
  ): Promise<ChatbotTokenStatusResponse> {
    try {
      return await this.chatbotTokenService.getStatusForUser(userId);
    } catch (error: any) {
      this.logger.error('Error getting chatbot token status: ' + error.message);
      throw error;
    }
  }

  /**
   * Descuenta el usage de la cuota que corresponda y devuelve el estado de
   * tokens ya actualizado para informarlo al front en la misma respuesta.
   * La ponderación por costo de modelo vive en el token service.
   */
  private async chargeUsage(
    tokenGate: TokenGateResult,
    usage: AiUsage | undefined,
    meta: { sessionId?: string; kind: AiUsageKind; model: string },
  ): Promise<ChatbotTokenStatusResponse> {
    return this.chatbotTokenService.chargeAndBuildStatus(
      tokenGate,
      usage,
      meta,
    );
  }

  private mapSessionToResponse(session: ChatSession): ChatSessionResponse {
    return {
      sessionId: session.getSessionId,
      userId: session.getUserId,
      messages: session.getMessages.map(msg => this.mapMessageToResponse(msg)),
      createdAt: session.getCreatedAt,
      updatedAt: session.getUpdatedAt,
      isActive: session.getIsActive,
    };
  }

  private mapMessageToResponse(message: ChatMessage): ChatMessageResponse {
    return {
      role: message.getRole,
      content: message.getContent,
      timestamp: message.getTimestamp,
      action: message.getAction,
    };
  }
}

