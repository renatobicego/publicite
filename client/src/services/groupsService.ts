"use server"
import { getClient } from "@/lib/client";
import { mockedGroups, mockedPosts } from "../utils/data/mockedData";
import { createNewGroupMutation } from "@/graphql/groupQueries";

export const getGroups = async (searchTerm: string | null) => {
  try {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return {items: mockedGroups};
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

export const postGroup = async (formData: any) => {
  return await getClient().mutate({
    mutation: createNewGroupMutation,
    variables: { groupDto: formData },
  }).then((res) => res.data.createNewGroup);
};
