"use server";
import axios from "axios";
import { getClient, query } from "@/lib/client";
import {
  editBoardByUsernameMutation,
  getBoardByUsernameQuery,
  getBoardsQuery,
} from "@/graphql/boardQueries";
import { currentUser } from "@clerk/nextjs/server";

export const getBoards = async (searchTerm: string | null, page: number) => {
  try {
    const { data } = await query({
      query: getBoardsQuery,
      variables: { board: searchTerm ? searchTerm : "", page, limit: 20 },
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
  const user = await currentUser();
  try {
    const { data } = await getClient().mutate({
      mutation: editBoardByUsernameMutation,
      variables: {
        updateBoardByIdId: id,
        boardData: values,
        ownerId: user?.publicMetadata.mongoId,
      },
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
    return data.findUserByUsername;
  } catch (error) {
    return {
      error:
        "Error al traer la pizarra del usuario. Por favor intenta de nuevo.",
    };
  }
};
