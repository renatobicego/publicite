import axios from "axios";
import { mockedBoards } from "../utils/data/mockedData";

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