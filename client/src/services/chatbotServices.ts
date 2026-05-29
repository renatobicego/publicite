"use server";
import {
  createChatSessionMutation,
  sendMessageMutation,
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
  // TODO: Remover mock cuando el BE despliegue el campo action
  const CREATE_AD_KEYWORDS = [
    "crear anuncio",
    "publicar",
    "quiero vender",
    "ofrecer servicio",
    "crear publicación",
    "necesito publicar",
  ];
  const messageLower = sendMessageRequest.message.toLowerCase();
  const wantsToCreateAd = CREATE_AD_KEYWORDS.some((kw) =>
    messageLower.includes(kw)
  );

  try {
    const {
      data: { sendMessageToChatbot },
    } = await getClient()
      .mutate({
        mutation: sendMessageMutation,
        variables: { sendMessageRequest },
      })
      .then((res) => res);

    // Mock: si el BE aún no devuelve action, detectamos del lado del FE
    const action = sendMessageToChatbot.action || (wantsToCreateAd ? "CREATE_AD" : null);

    return {
      botResponse: wantsToCreateAd && !sendMessageToChatbot.action
        ? "¡Genial! Te ayudo a crear tu anuncio. Tocá el botón de abajo para comenzar."
        : sendMessageToChatbot.botResponse,
      sessionId: sendMessageToChatbot.sessionId,
      timestamp: sendMessageToChatbot.timestamp,
      userMessage: sendMessageToChatbot.userMessage,
      action,
    };
  } catch (error) {
    return handleApolloError(error);
  }
};
