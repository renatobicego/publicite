import { mockedGroups } from "../utils/data/mockedData";

export const getGroups = async (searchTerm: string | null) => {
  try {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return mockedGroups;
  } catch (error) {
    return {
      error: "Error al traer las preferencias. Por favor intenta de nuevo.",
    };
  }
};
