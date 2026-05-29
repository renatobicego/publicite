export interface SendMessageRequest {
  sessionId?: string;
  message: string;
  userId?: string | null;
}

export type ChatbotAction = "CREATE_AD";

export interface SendMessageResponse {
  botResponse: string;
  sessionId: string;
  timestamp: string;
  userMessage: string;
  action?: ChatbotAction | null;
}
