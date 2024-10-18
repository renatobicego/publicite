"use server";
import axios from "axios";
import { getClient, query } from "@/lib/client";
import {
  editBoardByUsernameMutation,
  getBoardByUsernameQuery,
  getBoardsQuery,
} from "@/graphql/boardQueries";

export const getBoards = async (searchTerm: string | null, page: number) => {
  try {
    const { data } = await query({
      query: getBoardsQuery,
      variables: { board: searchTerm ? searchTerm : "", page, limit: 3 },
    });
    return {
      items: data.getBoardByAnnotationOrKeyword.boards,
      hasMore: data.getBoardByAnnotationOrKeyword.hasMore,
    };
  } catch (error) {
    return {
      error: "Error al traer las pizarras. Por favor intenta de nuevo.",
    };
  }
};

export const postBoard = async (values: any) => {
  return await axios.post(`${process.env.API_URL}/board`, values);
};

export const putBoard = async (id: string, values: any) => {
  try {
    const { data } = await getClient().mutate({
      mutation: editBoardByUsernameMutation,
      variables: { updateBoardByUsernameId: id, boardData: values },
    });
    return data;
  } catch (error) {
    return {
      error: "Error al editar la pizarra. Por favor intenta de nuevo.",
    };
  }
};

export const getBoardByUsername = async (username: string) => {
  try {
    const { data } = await query({
      query: getBoardByUsernameQuery,
      variables: { username },
    });
    return data.findOneByUsername;
  } catch (error) {
    return {
      error:
        "Error al traer los datos del usuario. Por favor intenta de nuevo.",
    };
  }
};
