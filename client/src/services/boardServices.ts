"use server";
import axios from "axios";
import { mockedBoards } from "../utils/data/mockedData";
import { getClient, query } from "@/lib/client";
import { editBoardByUsernameMutation, getBoardByUsernameQuery } from "@/graphql/boardQueries";

export const getBoards = async (searchTerm: string | null) => {
  await new Promise((resolve) => setTimeout(resolve, 1000));
  return [
    ...mockedBoards,
    ...mockedBoards.reverse(),
    mockedBoards[3],
    mockedBoards[0],
    mockedBoards[2],
    mockedBoards[1],
    ...mockedBoards,
    ...mockedBoards.reverse(),
  ]; // Return the same mocked data
};

export const postBoard = async(values: any) => {
  return await axios.post(`${process.env.API_URL}/board`, values)
}

export const putBoard = async(id: string, values: any) => {
  try {
    const { data } = await getClient().mutate({
      mutation: editBoardByUsernameMutation,
      variables: { updateBoardByUsernameId: id, boardData: values },
    });
    return data;
  } catch (error) {
    return {
      error:
        "Error al editar la pizarra. Por favor intenta de nuevo.",
    };
  }
}

export const getBoardByUsername = async(username: string) => {
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
}