import { Inject, Injectable } from '@nestjs/common';
import { ChatbotServiceInterface } from '../../domain/service/chatbot.service.interface';
import { ChatbotRepositoryInterface } from '../../domain/repository/chatbot.repository.interface';
import { ChatbotAIServiceInterface } from '../../domain/service/chatbot.ai.service.interface';
import { ChatSession } from '../../domain/entity/chat.session.entity';
import { ChatMessage } from '../../domain/entity/chat.message.entity';
import { MessageRole } from '../../domain/entity/enum/message.role.enum';
import { SendMessageRequest } from '../dto/HTTP-REQUEST/send.message.request';
import {
  ChatSessionResponse,
  SendMessageResponse,
  GetSessionHistoryResponse,
  ChatMessageResponse,
} from '../dto/HTTP-RESPONSE/chatbot.response';
import { MyLoggerService } from 'src/contexts/module_shared/logger/logger.service';
import { v4 as uuidv4 } from 'uuid';

/**
 * Flag para exigir un plan/suscripción habilitado para generar imágenes con IA.
 * Por ahora en `false`: cualquier usuario logueado puede generar (no se revisa el plan).
 * Cuando se quiera atar la feature a la suscripción, poner en `true` e implementar
 * el chequeo del plan en `generateAdImage` (ver TODO más abajo).
 */
const AI_IMAGE_REQUIRES_SUBSCRIPTION = false;

@Injectable()
export class ChatbotService implements ChatbotServiceInterface {
  constructor(
    @Inject('ChatbotRepositoryInterface')
    private readonly chatbotRepository: ChatbotRepositoryInterface,
    @Inject('ChatbotAIServiceInterface')
    private readonly chatbotAIService: ChatbotAIServiceInterface,
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

      let session = await this.chatbotRepository.findSessionById(sessionId);
      
      // Si no existe la sesión, crearla automáticamente
      if (!session) {
        this.logger.log('Session not found, creating new session automatically');
        const newSessionResponse = await this.createSession(sessionId);
        session = await this.chatbotRepository.findSessionById(newSessionResponse.sessionId);
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

      const aiResult = await this.chatbotAIService.generateResponse(
        session.getMessages,
        request.message,
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

      return {
        sessionId: sessionId,
        userMessage: request.message,
        botResponse: aiResult.content,
        timestamp: new Date(),
        action: aiResult.action,
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

  async generateAdImage(prompt: string, userId?: string): Promise<string> {
    try {
      this.logger.log(`Generating ad image for user: ${userId ?? 'anon'}`);

      if (AI_IMAGE_REQUIRES_SUBSCRIPTION) {
        // TODO: cuando se active, validar acá que el plan/suscripción del usuario
        // habilite la generación de imágenes con IA y lanzar un error si no.
        // Ej: const allowed = await this.subscriptionService.canGenerateAiImage(userId);
        //     if (!allowed) throw new Error('Tu plan no incluye generación de imágenes con IA');
        this.logger.warn(
          'AI_IMAGE_REQUIRES_SUBSCRIPTION está activo pero la validación de plan no está implementada',
        );
      }

      return await this.chatbotAIService.generateImage(prompt);
    } catch (error: any) {
      this.logger.error('Error generating ad image: ' + error.message);
      throw error;
    }
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

