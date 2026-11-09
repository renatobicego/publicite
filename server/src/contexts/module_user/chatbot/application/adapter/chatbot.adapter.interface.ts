import { SendMessageRequest } from '../dto/HTTP-REQUEST/send.message.request';
import {
  ChatSessionResponse,
  SendMessageResponse,
  GetSessionHistoryResponse,
  GetUserChatSessionsResponse,
} from '../dto/HTTP-RESPONSE/chatbot.response';
import { ChatbotTokenStatusResponse } from '../dto/HTTP-RESPONSE/chatbot.token.response';

export interface ChatbotAdapterInterface {
  createSession(userId?: string): Promise<ChatSessionResponse>;
  sendMessage(request: SendMessageRequest): Promise<SendMessageResponse>;
  /** Sólo devuelve conversaciones de `requesterId`. */
  getSessionHistory(sessionId: string, requesterId: string, limit?: number, page?: number): Promise<GetSessionHistoryResponse>;
  getUserChatSessions(userId: string, limit?: number, page?: number): Promise<GetUserChatSessionsResponse>;
  /** Sólo borra conversaciones de `requesterId`. */
  deleteSession(sessionId: string, requesterId: string): Promise<boolean>;
  generateAdImage(
    prompt: string,
    userId?: string,
    referenceImages?: string[],
  ): Promise<string>;
  getTokenStatusForUser(userId: string): Promise<ChatbotTokenStatusResponse>;
}

