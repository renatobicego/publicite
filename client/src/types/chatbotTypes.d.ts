export interface SendMessageRequest {
  sessionId?: string;
  message: string;
  userId?: string | null;
}
