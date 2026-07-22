import { ChatMessage } from '../entity/chat.message.entity';
import { ChatbotAction } from '../entity/enum/chatbot.action.enum';
import { AiUsage } from '../entity/chatbot.token.types';

export interface ChatbotAIResult {
  content: string;
  action?: ChatbotAction;
  /** Tokens reales consumidos por la request (informado por OpenAI). */
  usage?: AiUsage;
  /** Modelo de OpenAI que atendió la request (para el tracking de consumo). */
  model?: string;
}

export interface GeneratedImageResult {
  /** Imagen como data URL en base64 (data:image/png;base64,...). */
  imageBase64: string;
  /** Tokens reales consumidos, si OpenAI los informa para el modelo de imagen. */
  usage?: AiUsage;
  model?: string;
}

export interface ChatbotAIServiceInterface {
  generateResponse(
    conversationHistory: ChatMessage[],
    userMessage: string,
  ): Promise<ChatbotAIResult>;

  /**
   * Genera una imagen a partir de un prompt usando OpenAI.
   */
  generateImage(prompt: string): Promise<GeneratedImageResult>;
}
