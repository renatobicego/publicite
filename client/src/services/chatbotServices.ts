"use server";
import {
  createChatSessionMutation,
  generateAdImageMutation,
  sendMessageMutation,
  getChatSessionHistoryQuery,
  deleteChatSessionMutation,
  getUserChatSessionsQuery,
} from "@/graphql/chatBotQueries";
import { getClient } from "@/lib/client";
import { SendMessageRequest } from "@/types/chatbotTypes";
import { handleApolloError } from "@/utils/functions/errorHandler";
import { auth } from "@clerk/nextjs/server";

export const createChatWithAI = async () => {
  try {
    const authData = auth();

    const { data } = await getClient()
      .mutate({
        mutation: createChatSessionMutation,
        variables: { userId: authData.userId },
      })
      .then((res) => res);
    return {
      sessionId: data.sessionId,
    };
  } catch (error) {
    return handleApolloError(error);
  }
};

export const sendMessageToAI = async (
  sendMessageRequest: SendMessageRequest
) => {
  try {
    // Asociar la conversación al usuario logueado (mismo criterio que getUserChatSessions)
    // para que la sesión quede guardada bajo su userId y aparezca luego en el historial.
    // Si no está logueado, se envía sin userId (chat anónimo, sin historial).
    const authData = auth();
    const userId = authData.sessionClaims?.metadata.mongoId;

    const {
      data: { sendMessageToChatbot },
    } = await getClient()
      .mutate({
        mutation: sendMessageMutation,
        variables: {
          sendMessageRequest: userId
            ? { ...sendMessageRequest, userId }
            : sendMessageRequest,
        },
      })
      .then((res) => res);

    return {
      botResponse: sendMessageToChatbot.botResponse,
      sessionId: sendMessageToChatbot.sessionId,
      timestamp: sendMessageToChatbot.timestamp,
      userMessage: sendMessageToChatbot.userMessage,
      action: sendMessageToChatbot.action ?? null,
    };
  } catch (error) {
    return handleApolloError(error);
  }
};

export const generateAdImageWithAI = async (prompt: string) => {
  try {
    const {
      data: { generateAdImage },
    } = await getClient()
      .mutate({
        mutation: generateAdImageMutation,
        variables: { generateAdImageRequest: { prompt } },
      })
      .then((res) => res);
    return {
      imageBase64: generateAdImage.imageBase64 as string,
    };
  } catch (error) {
    return handleApolloError(error);
  }
};

// ============================================================
// CHAT HISTORY SERVICES
// ============================================================

/**
 * Obtiene los mensajes de una sesión específica.
 * USA: getChatSessionHistory (YA EXISTE en BE)
 */
export const getChatSessionHistory = async (
  sessionId: string,
  limit?: number,
  page?: number
) => {
  try {
    const {
      data: { getChatSessionHistory: result },
    } = await getClient()
      .query({
        query: getChatSessionHistoryQuery,
        variables: { sessionId, limit, page },
        fetchPolicy: "no-cache",
      })
      .then((res) => res);

    return result;
  } catch (error) {
    return handleApolloError(error);
  }
};

/**
 * Elimina una sesión de chat completa.
 * USA: deleteChatSession (YA EXISTE en BE)
 */
export const deleteChatSessionService = async (sessionId: string) => {
  try {
    const {
      data: { deleteChatSession: result },
    } = await getClient()
      .mutate({
        mutation: deleteChatSessionMutation,
        variables: { sessionId },
      })
      .then((res) => res);

    return { success: result };
  } catch (error) {
    return handleApolloError(error);
  }
};

/**
 * Obtiene la lista de sesiones/conversaciones del usuario.
 * USA: getUserChatSessions (implementado en BE)
 */
export const getUserChatSessions = async (page = 1, limit = 20) => {
  try {
    const authData = auth();
    const userId = authData.sessionClaims?.metadata.mongoId;
    if (!userId) {
      return { error: "Usuario no autenticado" };
    }

    const {
      data: { getUserChatSessions: result },
    } = await getClient()
      .query({
        query: getUserChatSessionsQuery,
        variables: { userId, limit, page },
        fetchPolicy: "no-cache",
      })
      .then((res) => res);

    return result;
  } catch (error) {
    return handleApolloError(error);
  }
};
