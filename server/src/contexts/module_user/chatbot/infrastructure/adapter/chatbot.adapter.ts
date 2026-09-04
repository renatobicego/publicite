import { Inject, Injectable } from '@nestjs/common';
import { ChatbotAdapterInterface } from '../../application/adapter/chatbot.adapter.interface';
import { ChatbotServiceInterface } from '../../domain/service/chatbot.service.interface';
import { SendMessageRequest } from '../../application/dto/HTTP-REQUEST/send.message.request';
import {
  ChatSessionResponse,
  SendMessageResponse,
  GetSessionHistoryResponse,
  GetUserChatSessionsResponse,
} from '../../application/dto/HTTP-RESPONSE/chatbot.response';
import { ChatbotTokenStatusResponse } from '../../application/dto/HTTP-RESPONSE/chatbot.token.response';

@Injectable()
export class ChatbotAdapter implements ChatbotAdapterInterface {
  constructor(
    @Inject('ChatbotServiceInterface')
    private readonly chatbotService: ChatbotServiceInterface,
  ) {}

  async createSession(userId?: string): Promise<ChatSessionResponse> {
    try {
      return await this.chatbotService.createSession(userId);
    } catch (error: any) {
      throw error;
    }
  }

  async sendMessage(request: SendMessageRequest): Promise<SendMessageResponse> {
    try {
      return await this.chatbotService.sendMessage(request);
    } catch (error: any) {
      throw error;
    }
  }

  async getSessionHistory(
    sessionId: string,
    limit?: number,
    page?: number,
  ): Promise<GetSessionHistoryResponse> {
    try {
      return await this.chatbotService.getSessionHistory(sessionId, limit, page);
    } catch (error: any) {
      throw error;
    }
  }

  async deleteSession(sessionId: string): Promise<boolean> {
    try {
      return await this.chatbotService.deleteSession(sessionId);
    } catch (error: any) {
      throw error;
    }
  }

  async getUserChatSessions(
    userId: string,
    limit?: number,
    page?: number,
  ): Promise<GetUserChatSessionsResponse> {
    try {
      return await this.chatbotService.getUserChatSessions(userId, limit, page);
    } catch (error: any) {
      throw error;
    }
  }

  async generateAdImage(
    prompt: string,
    userId?: string,
    referenceImages?: string[],
  ): Promise<string> {
    try {
      return await this.chatbotService.generateAdImage(
        prompt,
        userId,
        referenceImages,
      );
    } catch (error: any) {
      throw error;
    }
  }

  async getTokenStatusForUser(
    userId: string,
  ): Promise<ChatbotTokenStatusResponse> {
    try {
      return await this.chatbotService.getTokenStatusForUser(userId);
    } catch (error: any) {
      throw error;
    }
  }
}

