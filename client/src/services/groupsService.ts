"use server";
import { getClient, query } from "@/lib/client";
import {
  mockedPetitions,
  mockedPosts,
} from "../utils/data/mockedData";
import {
  createNewGroupMutation,
  getGroupByIdQuery,
  getGroupsQuery,
  makeAdminMutation,
} from "@/graphql/groupQueries";
import { cookies } from "next/headers";
import { auth } from "@clerk/nextjs/server";

export const getGroups = async (searchTerm: string | null) => {
  try {
    const { data } = await query({
      query: getGroupsQuery,
      variables: { name: searchTerm ? searchTerm : "", limit: 20.0 },
    });
    return { items: data.getGroupByName.groups, hasMore: data.getGroupByName.hasMore };
  } catch (error) {
    return {
      error: "Error al traer grupos. Por favor intenta de nuevo.",
    };
  }
};

export const getGroupById = async (id: string) => {
  try {
    const { data } = await query({
      query: getGroupByIdQuery,
      variables: { getGroupByIdId: id },
      context: {
        headers: {
          Cookie: cookies().toString(),
        },
      }
    });

    return data.getGroupById;
  } catch (error) {
    return {
      error:
        "Error al traer información del grupo. Por favor intenta de nuevo.",
    };
  }
};

export const getGroupPosts = async (
  searchTerm: string | null,
  groupId?: string
) => {
  if (!groupId)
    return {
      error: "Error al traer anuncios del grupo. Por favor intenta de nuevo.",
    };
  try {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return { items: [...mockedPosts, ...mockedPetitions], hasMore: false };
  } catch (error) {
    return {
      error: "Error al traer anuncios del grupo. Por favor intenta de nuevo.",
    };
  }
};

export const postGroup = async (formData: any) => {
  return await getClient()
    .mutate({
      mutation: createNewGroupMutation,
      variables: { groupDto: formData },
    })
    .then((res) => res.data.createNewGroup);
};

export const putAdminGroup = async (groupId: string, userIds: string[]) => {
  const groupAdmin = auth().sessionClaims?.metadata.mongoId;
  try {
  return await getClient()
    .mutate({
      mutation: makeAdminMutation,
      variables: { groupId, newAdmins: userIds, groupAdmin },
    })
    .then((res) => res);
    
  } catch (error) {
    return {
      error: "Error al agregar administrador al grupo. Por favor intenta de nuevo.",
    }
  }
}