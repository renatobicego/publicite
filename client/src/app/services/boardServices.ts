import { mockedBoards } from "../utils/data/mockedData";

export const getBoards = async () => {
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
