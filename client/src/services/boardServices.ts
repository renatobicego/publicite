"use server";
import axios from "axios";
import { getClient, query } from "@/lib/client";
import {
  editBoardByUsernameMutation,
  getBoardByUsernameQuery,
  getBoardsQuery,
  postBoardMutation,
} from "@/graphql/boardQueries";
import { auth, currentUser } from "@clerk/nextjs/server";

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
      error: "Error al traer las pizarras. Por favor intenta de nuevo. ",
    };
  }
};

export const postBoard = async (values: any) => {
  try {
    await getClient().mutate({
      mutation: postBoardMutation,
      variables: {
        boardRequest: values
      },
      context: {
        headers: {
          Authorization: `${await auth().getToken({ template: "testing" })}`,
        },
      },
    })

    return {message: "Pizarra creada exitosamente"}
  } catch (error) {
    return {
      error: "Error al crear la pizarra. Por favor intenta de nuevo.",
    }
  }
};

export const putBoard = async (id: string, values: any) => {
  const user = auth();

  if (!user.sessionId) {
    return { error: "Usuario no autenticado. Por favor inicie sesión." };
  }
  try {
    const { data } = await getClient().mutate({
      mutation: editBoardByUsernameMutation,
      variables: {
        updateBoardByIdId: id,
        boardData: values
      },
      context: {
        headers: {
          Authorization: `${await auth().getToken({ template: "testing" })}`,
        },
      },
    });
    return data;
  } catch (error) {
    console.log(error)
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
      context: {
        headers: {
          Authorization: `${await auth().getToken({ template: "testing" })}`,
        },
      }
    });
    return data.findUserByUsername;
  } catch (error) {
    
    return {
      error:
        "Error al traer la pizarra del usuario. Por favor intenta de nuevo.",
    };
  }
};
