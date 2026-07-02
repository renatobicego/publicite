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

// ============================================================
// CHAT HISTORY TYPES
// ============================================================

/**
 * Respuesta de getChatSessionHistory (YA EXISTE en BE)
 */
export interface ChatMessageFromHistory {
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  action?: ChatbotAction | null;
}

export interface GetChatSessionHistoryResponse {
  sessionId: string;
  messages: ChatMessageFromHistory[];
  totalMessages: number;
}

/**
 * Tipos para la lista de sesiones del usuario (NO EXISTE aún en BE).
 * El repositorio ya tiene `findSessionsByUserId`, solo falta exponerlo como query GraphQL.
 * Descomentar/usar cuando se implemente getUserChatSessions en el BE.
 */
export interface ChatSessionSummary {
  sessionId: string;
  title: string;
  lastMessage?: string;
  lastMessageAt: string;
  messageCount: number;
  createdAt: string;
}

export interface GetUserChatSessionsResponse {
  sessions: ChatSessionSummary[];
  totalCount: number;
  hasMore: boolean;
}
