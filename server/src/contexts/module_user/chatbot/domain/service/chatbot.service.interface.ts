import { SendMessageRequest } from '../../application/dto/HTTP-REQUEST/send.message.request';
import {
  ChatSessionResponse,
  SendMessageResponse,
  GetSessionHistoryResponse,
  GetUserChatSessionsResponse,
} from '../../application/dto/HTTP-RESPONSE/chatbot.response';
import { ChatbotTokenStatusResponse } from '../../application/dto/HTTP-RESPONSE/chatbot.token.response';

export interface ChatbotServiceInterface {
  createSession(userId?: string): Promise<ChatSessionResponse>;
  sendMessage(request: SendMessageRequest): Promise<SendMessageResponse>;
  getSessionHistory(sessionId: string, limit?: number, page?: number): Promise<GetSessionHistoryResponse>;
  getUserChatSessions(userId: string, limit?: number, page?: number): Promise<GetUserChatSessionsResponse>;
  deleteSession(sessionId: string): Promise<boolean>;
  generateAdImage(prompt: string, userId?: string): Promise<string>;
  getTokenStatusForUser(userId: string): Promise<ChatbotTokenStatusResponse>;
}

