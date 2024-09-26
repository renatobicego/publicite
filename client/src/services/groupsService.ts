import { mockedGroups, mockedPosts } from "../utils/data/mockedData";

export const getGroups = async (searchTerm: string | null) => {
  try {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return mockedGroups;
  } catch (error) {
    return {
      error: "Error al traer grupos. Por favor intenta de nuevo.",
    };
  }
};

export const getGroupById = async (id: string) => {
  try {
    return mockedGroups[0];
  } catch (error) {
    return {
      error: "Error al traer información del grupo. Por favor intenta de nuevo.",
    };
  }
};

export const getGroupPosts = async (searchTerm: string | null, groupId?: string) => {
  if(!groupId) return {error: "Error al traer anuncios del grupo. Por favor intenta de nuevo."}
  try {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return mockedPosts;
  } catch (error) {
    return {
      error: "Error al traer anuncios del grupo. Por favor intenta de nuevo.",
    };
  }
};
