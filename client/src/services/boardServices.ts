"use server";
import { getClient, query } from "@/lib/client";
import {
  editBoardByUsernameMutation,
  getBoardByUsernameQuery,
  getBoardsQuery,
  postBoardMutation,
} from "@/graphql/boardQueries";
import { getApiContext } from "./apiContext";
import { handleApolloError } from "@/utils/functions/errorHandler";
import { getAuthToken } from "./auth-token";

export const getBoards = async (searchTerm: string | null, page: number) => {
  try {
    const tokenCache = await getAuthToken();
    const { context } = await getApiContext(true, tokenCache);
    const { data } = await query({
      query: getBoardsQuery,
      variables: { board: searchTerm ? searchTerm : "", page, limit: 20 },
      context,
    });
    return {
      items: data.getBoardByAnnotationOrKeyword.boards,
      hasMore: data.getBoardByAnnotationOrKeyword.hasMore,
    };
  } catch (error) {
    return handleApolloError(error);
  }
};

export const postBoard = async (values: any) => {
  try {
    const tokenCache = await getAuthToken();
    const { context } = await getApiContext(false, tokenCache);
    const { data } = await getClient().mutate({
      mutation: postBoardMutation,
      variables: {
        boardRequest: values,
      },
      context,
    });

    return data.createBoard;
  } catch (error) {
    return handleApolloError(error);
  }
};

export const putBoard = async (id: string, values: any) => {
  const tokenCache = await getAuthToken();
  const { context } = await getApiContext(false, tokenCache);
  try {
    const { data } = await getClient().mutate({
      mutation: editBoardByUsernameMutation,
      variables: {
        updateBoardByIdId: id,
        boardData: values,
      },
      context,
    });
    return data.updateBoardById;
  } catch (error) {
    return handleApolloError(error);
  }
};

export const getBoardByUsername = async (id: string, token?: string | null) => {
  try {
    const { context } = await getApiContext(false, token);
    const { data } = await query({
      query: getBoardByUsernameQuery,
      variables: { id },
      context,
    });
    return data.findUserById;
  } catch (error) {
    return handleApolloError(error);
  }
};
