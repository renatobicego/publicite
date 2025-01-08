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

export const getBoards = async (searchTerm: string | null, page: number) => {
  try {
    const { context } = await getApiContext(true);
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
    return handleApolloError(error)
  }
};

export const postBoard = async (values: any) => {
  try {
    const { context } = await getApiContext();
    const { data } = await getClient().mutate({
      mutation: postBoardMutation,
      variables: {
        boardRequest: values,
      },
      context,
    });

    return data.createBoard;
  } catch (error) {
    return handleApolloError(error)
  }
};

export const putBoard = async (id: string, values: any) => {
  const { context } = await getApiContext();
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
    return handleApolloError(error)
  }
};

export const getBoardByUsername = async (username: string) => {
  try {
    const { context } = await getApiContext();
    const { data } = await query({
      query: getBoardByUsernameQuery,
      variables: { username },
      context,
    });
    return data.findUserByUsername;
  } catch (error) {
    return handleApolloError(error)
  }
};
