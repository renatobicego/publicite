import { SendMessageRequest } from '../../application/dto/HTTP-REQUEST/send.message.request';
import { 
  ChatSessionResponse, 
  SendMessageResponse,
  GetSessionHistoryResponse 
} from '../../application/dto/HTTP-RESPONSE/chatbot.response';

export interface ChatbotServiceInterface {
  createSession(userId?: string): Promise<ChatSessionResponse>;
  sendMessage(request: SendMessageRequest): Promise<SendMessageResponse>;
  getSessionHistory(sessionId: string, limit?: number, page?: number): Promise<GetSessionHistoryResponse>;
  deleteSession(sessionId: string): Promise<boolean>;
}

