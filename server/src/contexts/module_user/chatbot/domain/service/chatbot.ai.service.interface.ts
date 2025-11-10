import { ChatMessage } from '../entity/chat.message.entity';

export interface ChatbotAIServiceInterface {
  generateResponse(conversationHistory: ChatMessage[], userMessage: string): Promise<string>;
}

