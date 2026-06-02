"use server";
import {
  createChatSessionMutation,
  generateAdImageMutation,
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
  try {
    const {
      data: { sendMessageToChatbot },
    } = await getClient()
      .mutate({
        mutation: sendMessageMutation,
        variables: { sendMessageRequest },
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
