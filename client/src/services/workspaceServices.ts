"use server";

import { getClient, query } from "@/lib/client";
import {
  startValuacionMutation,
  sendValuacionMessageMutation,
  skipValuacionBriefQuestionMutation,
  generateValuacionResultMutation,
  saveValuacionResultMutation,
  restoreValuacionToBoardMutation,
  deleteValuacionMutation,
  linkValuacionToPostMutation,
  getUserValuacionesQuery,
  getValuacionByPostQuery,
  getValuacionPostDraftQuery,
  searchMatchMutation,
} from "@/graphql/workspaceQueries";
import { handleApolloError } from "@/utils/functions/errorHandler";
import { getApiContext } from "./apiContext";
import { ValuacionCategory, CubitoMode } from "@/types/workspaceTypes";

// ============================================================
// VALUACIÓN IA
// ============================================================

export const startValuacion = async (input: {
  category: ValuacionCategory;
  imageUrls?: string[];
  description?: string;
  mode?: CubitoMode;
  sessionId?: string;
}) => {
  try {
    const { context } = await getApiContext();
    const { data } = await getClient().mutate({
      mutation: startValuacionMutation,
      variables: { input },
      context,
    });
    return data.startValuacion;
  } catch (error) {
    return handleApolloError(error);
  }
};

export const sendValuacionMessage = async (input: {
  valuacionId: string;
  message: string;
  imageUrls?: string[];
}) => {
  try {
    const { context } = await getApiContext();
    const { data } = await getClient().mutate({
      mutation: sendValuacionMessageMutation,
      variables: { input },
      context,
    });
    return data.sendValuacionMessage;
  } catch (error) {
    return handleApolloError(error);
  }
};

export const skipValuacionBriefQuestion = async (valuacionId: string) => {
  try {
    const { context } = await getApiContext();
    const { data } = await getClient().mutate({
      mutation: skipValuacionBriefQuestionMutation,
      variables: { valuacionId },
      context,
    });
    return data.skipValuacionBriefQuestion;
  } catch (error) {
    return handleApolloError(error);
  }
};

export const generateValuacionResult = async (valuacionId: string) => {
  try {
    const { context } = await getApiContext();
    const { data } = await getClient().mutate({
      mutation: generateValuacionResultMutation,
      variables: { valuacionId },
      context,
    });
    return data.generateValuacionResult;
  } catch (error) {
    return handleApolloError(error);
  }
};

export const saveValuacionResult = async (valuacionId: string) => {
  try {
    const { context } = await getApiContext();
    const { data } = await getClient().mutate({
      mutation: saveValuacionResultMutation,
      variables: { valuacionId },
      context,
    });
    return data.saveValuacionResult;
  } catch (error) {
    return handleApolloError(error);
  }
};

export const restoreValuacionToBoard = async (valuacionId: string) => {
  try {
    const { context } = await getApiContext();
    const { data } = await getClient().mutate({
      mutation: restoreValuacionToBoardMutation,
      variables: { valuacionId },
      context,
    });
    return data.restoreValuacionToBoard;
  } catch (error) {
    return handleApolloError(error);
  }
};

export const deleteValuacion = async (valuacionId: string) => {
  try {
    const { context } = await getApiContext();
    const { data } = await getClient().mutate({
      mutation: deleteValuacionMutation,
      variables: { valuacionId },
      context,
    });
    return data.deleteValuacion;
  } catch (error) {
    return handleApolloError(error);
  }
};

export const linkValuacionToPost = async (valuacionId: string, postId: string) => {
  try {
    const { context } = await getApiContext();
    const { data } = await getClient().mutate({
      mutation: linkValuacionToPostMutation,
      variables: { valuacionId, postId },
      context,
    });
    return data.linkValuacionToPost;
  } catch (error) {
    return handleApolloError(error);
  }
};

export const getUserValuaciones = async (limit = 20, page = 1) => {
  try {
    const { context } = await getApiContext();
    const { data } = await query({
      query: getUserValuacionesQuery,
      variables: { limit, page },
      context,
      fetchPolicy: "no-cache",
    });
    return data.getUserValuaciones;
  } catch (error) {
    return handleApolloError(error);
  }
};

export const getValuacionByPost = async (postId: string) => {
  try {
    const { data } = await query({
      query: getValuacionByPostQuery,
      variables: { postId },
      fetchPolicy: "no-cache",
    });
    return data.getValuacionByPost;
  } catch (error) {
    return handleApolloError(error);
  }
};

export const getValuacionPostDraft = async (valuacionId: string) => {
  try {
    const { context } = await getApiContext();
    const { data } = await query({
      query: getValuacionPostDraftQuery,
      variables: { valuacionId },
      context,
      fetchPolicy: "no-cache",
    });
    return data.getValuacionPostDraft;
  } catch (error) {
    return handleApolloError(error);
  }
};

// ============================================================
// MATCH IA
// ============================================================

export const searchMatch = async (input: {
  text?: string;
  imageUrls?: string[];
  postId?: string;
  mode?: CubitoMode;
  sessionId?: string;
}) => {
  try {
    const { context } = await getApiContext(true);
    const { data } = await getClient().mutate({
      mutation: searchMatchMutation,
      variables: { input },
      context,
    });
    return data.searchMatch;
  } catch (error) {
    return handleApolloError(error);
  }
};
