import { ChatMessage } from '../entity/chat.message.entity';
import { ChatbotAction } from '../entity/enum/chatbot.action.enum';

export interface ChatbotAIResult {
  content: string;
  action?: ChatbotAction;
}

export interface ChatbotAIServiceInterface {
  generateResponse(
    conversationHistory: ChatMessage[],
    userMessage: string,
  ): Promise<ChatbotAIResult>;

  /**
   * Genera una imagen a partir de un prompt usando OpenAI.
   * Devuelve la imagen como data URL en base64 (data:image/png;base64,...).
   */
  generateImage(prompt: string): Promise<string>;
}
