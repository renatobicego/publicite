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
    };
  } catch (error) {
    return handleApolloError(error);
  }
};
