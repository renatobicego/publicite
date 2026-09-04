import gql from "graphql-tag";

// ============================================================
// CHAT HISTORY QUERIES
// ============================================================

/**
 * Query que YA EXISTE en el BE.
 * Trae los mensajes de una sesión específica.
 * Args: sessionId (required), limit (optional), page (optional)
 */
export const getChatSessionHistoryQuery = gql`
  query GetChatSessionHistory($sessionId: String!, $limit: Float, $page: Float) {
    getChatSessionHistory(sessionId: $sessionId, limit: $limit, page: $page) {
      sessionId
      messages {
        role
        content
        timestamp
        action
      }
      totalMessages
    }
  }
`;

/**
 * Mutation que YA EXISTE en el BE.
 * Elimina una sesión de chat completa (sesión + todos los mensajes).
 */
export const deleteChatSessionMutation = gql`
  mutation DeleteChatSession($sessionId: String!) {
    deleteChatSession(sessionId: $sessionId)
  }
`;

/**
 * Query que ahora EXISTE en el BE.
 * Lista todas las sesiones de chat de un usuario.
 */
export const getUserChatSessionsQuery = gql`
  query GetUserChatSessions($userId: String!, $limit: Float, $page: Float) {
    getUserChatSessions(userId: $userId, limit: $limit, page: $page) {
      sessions {
        sessionId
        title
        lastMessage
        lastMessageAt
        messageCount
        createdAt
      }
      totalCount
      hasMore
    }
  }
`;

// ============================================================

export const createChatSessionMutation = gql`
  mutation CreateChatSession($createSessionRequest: CreateSessionRequest) {
    createChatSession(createSessionRequest: $createSessionRequest) {
      messages {
        content
        role
        timestamp
      }
      sessionId
    }
  }
`;

export const sendMessageMutation = gql`
  mutation SendMessageToChatbot($sendMessageRequest: SendMessageRequest!) {
    sendMessageToChatbot(sendMessageRequest: $sendMessageRequest) {
      botResponse
      sessionId
      timestamp
      userMessage
      action
      limitReached
      tokenStatus {
        hasActivePaidPlan
        source
        allowance
        used
        remaining
        communityTokensAvailable
        resetsAt
      }
    }
  }
`;

/**
 * Estado de tokens Publicité de IA del usuario logueado (para el perfil).
 * Requiere token de Clerk (guard estricto en el BE).
 */
export const getMyChatbotTokenStatusQuery = gql`
  query GetMyChatbotTokenStatus {
    getMyChatbotTokenStatus {
      hasActivePaidPlan
      source
      allowance
      used
      remaining
      communityTokensAvailable
      resetsAt
    }
  }
`;

export const generateAdImageMutation = gql`
  mutation GenerateAdImage($generateAdImageRequest: GenerateAdImageRequest!) {
    generateAdImage(generateAdImageRequest: $generateAdImageRequest) {
      imageBase64
    }
  }
`;
// Nota: GenerateAdImageRequest acepta un campo opcional referenceImages: [String]
// (data URLs base64 de imágenes previas) para generar de forma contextual.
