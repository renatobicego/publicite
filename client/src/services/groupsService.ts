"use server";
import { getClient, query } from "@/lib/client";
import { mockedPetitions, mockedPosts } from "../utils/data/mockedData";
import {
  createNewGroupMutation,
  deleteMemberMutation,
  editGroupMutation,
  getGroupByIdQuery,
  getGroupMembersByIdQuery,
  getGroupsQuery,
  makeAdminMutation,
} from "@/graphql/groupQueries";
import { cookies } from "next/headers";
import { auth } from "@clerk/nextjs/server";
import { ApolloError } from "@apollo/client";

export const getGroups = async (searchTerm: string | null, page: number) => {
  try {
    const { data } = await query({
      query: getGroupsQuery,
      variables: { name: searchTerm ? searchTerm : "", limit: 3, page },
      context: {
        headers: {
          Cookie: cookies().toString(),
        },
      },
    });
    return {
      items: data.getGroupByName.groups,
      hasMore: data.getGroupByName.hasMore,
    };
  } catch (error) {
    console.log(error)
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
      // context: {
      //   headers: {
      //     Cookie: cookies().toString(),
      //   },
      // },
    });

    return data.getGroupById;
  } catch (error: ApolloError | any) {
    console.log(error)
    return {
      error:
        "Error al traer información del grupo. Por favor intenta de nuevo.", error2: error.cause,
    };
  }
};

export const getGroupMembersById = async (id: string) => {
  try {
    const { data } = await query({
      query: getGroupMembersByIdQuery,
      variables: { getGroupByIdId: id },
      context: {
        headers: {
          Cookie: cookies().toString(),
        },
      },
    });

    return data.getGroupById;
  } catch (error) {
    console.log(error)
    return {
      error:
        "Error al traer los miembros del grupo. Por favor intenta de nuevo.",
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

export const putGroup = async (groupToUpdate: any) => {
  try {
    const { data } = await getClient()
      .mutate({
        mutation: editGroupMutation,
        variables: { groupToUpdate },
      })
      .then((res) => res);
    console.log(data);
    return {
      message: "Grupo editado exitosamente",
      id: data.updateGroupById,
    };
  } catch (error) {
    console.log(error)
    return {
      error: "Error al editar el grupo. Por favor intenta de nuevo.",
    };
  }
};

export const putAdminGroup = async (groupId: string, userIds: string[]) => {
  const groupAdmin = auth().sessionClaims?.metadata.mongoId;
  try {
    await getClient().mutate({
      mutation: makeAdminMutation,
      variables: { groupId, newAdmins: userIds, groupAdmin },
    });
    return { message: "Administrador agregado" };
  } catch (error) {
    return {
      error:
        "Error al agregar administrador al grupo. Por favor intenta de nuevo.",
    };
  }
};

export const deleteMember = async (groupId: string, userIds: string[]) => {
  const groupAdmin = auth().sessionClaims?.metadata.mongoId;
  try {
    await getClient()
      .mutate({
        mutation: deleteMemberMutation,
        variables: { groupId, membersToDelete: userIds, groupAdmin },
      })
      .then((res) => res);

    return { message: "Miembro eliminado" };
  } catch (error) {
    return {
      error: "Error al quitar mimebro del grupo. Por favor intenta de nuevo.",
    };
  }
};
