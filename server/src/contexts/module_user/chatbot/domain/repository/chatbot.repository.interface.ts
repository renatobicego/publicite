import { ChatSession } from '../entity/chat.session.entity';
import { ChatMessage } from '../entity/chat.message.entity';

export interface ChatbotRepositoryInterface {
  createSession(session: ChatSession): Promise<ChatSession>;
  findSessionById(sessionId: string): Promise<ChatSession | null>;
  updateSession(sessionId: string, messages: ChatMessage[]): Promise<ChatSession | null>;
  deleteSession(sessionId: string): Promise<boolean>;
  findSessionsByUserId(userId: string, limit: number, page: number): Promise<ChatSession[]>;
  deactivateSession(sessionId: string): Promise<boolean>;
}

