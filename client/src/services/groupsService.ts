"use server";
import { getClient, query } from "@/lib/client";
import {
  acceptGroupInvitationMutation,
  acceptJoinRequestMutation,
  createNewGroupMutation,
  deleteAdminMutation,
  deleteGroupMutation,
  deleteMemberMutation,
  editGroupMutation,
  exitGroupMutation,
  getGroupAdminsByIdQuery,
  getGroupByIdQuery,
  getGroupMembersByIdQuery,
  getGroupsQuery,
  getMemberPosts,
  makeAdminMutation,
  validateGroupAliasQuery,
} from "@/graphql/groupQueries";
import { auth } from "@clerk/nextjs/server";
import { ApolloError } from "@apollo/client";
import { Post } from "@/types/postTypes";
import { PostGroup } from "@/app/(root)/crear/grupo/CreateGroupForm";
import { handleApolloError } from "@/utils/functions/errorHandler";
import { Coordinates } from "@/app/(root)/providers/LocationProvider";
import { Group } from "@/types/groupTypes";

export const getGroups = async (searchTerm: string | null, page: number) => {
  try {
    const { data } = await query({
      query: getGroupsQuery,
      variables: { name: searchTerm ? searchTerm : "", limit: 20, page },
      context: {
        headers: {
          Authorization: await auth().getToken({ template: "testing" }),
        },
      },
    });
    return {
      items: data.getGroupByNameOrAlias.groups,
      hasMore: data.getGroupByNameOrAlias.hasMore,
    };
  } catch (error) {
    return handleApolloError(error);
  }
};

export const getGroupById = async (id: string) => {
  try {
    const { data } = await query({
      query: getGroupByIdQuery,
      variables: { getGroupByIdId: id },
      context: {
        headers: {
          Authorization: await auth().getToken({ template: "testing" }),
        },
        fetchOptions: {
          cache: "no-cache",
        },
      },
    });
    const { getGroupById } = data;
    const { group, isMember, hasJoinRequest, hasGroupRequest } = getGroupById;

    return { group, isMember, hasJoinRequest, hasGroupRequest };
  } catch (error: ApolloError | any) {
    return {
      error:
        "Error al traer información del grupo. Por favor intenta de nuevo.",
      error2: error.cause,
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
          Authorization: await auth().getToken({ template: "testing" }),
        },
      },
    });

    return data.getGroupById.group;
  } catch (error) {
    console.log(error);
    return {
      error:
        "Error al traer los miembros del grupo. Por favor intenta de nuevo.",
    };
  }
};

export const getGroupAdminsById = async (id: string) => {
  try {
    const { data } = await query({
      query: getGroupAdminsByIdQuery,
      variables: { getGroupByIdId: id },
      context: {
        headers: {
          Authorization: await auth().getToken({ template: "testing" }),
        },
      },
    });

    return data.getGroupById.group;
  } catch (error) {
    console.log(error);
    return {
      error:
        "Error al traer los administradores del grupo. Por favor intenta de nuevo.",
    };
  }
};

export const getGroupPosts = async (
  page: number,
  groupId: string,
  coordinates: Coordinates | null,
  membersId: string[]
) => {
  try {
    if (!coordinates) {
      return {
        error: "Error al traer los anuncios. Por favor intenta de nuevo.",
      };
    }
    const { data } = await query({
      query: getMemberPosts,
      variables: {
        getPostsOfGroupMembersId: groupId,
        limit: 30,
        page,
        userLocation: coordinates,
        idsMembersArray: membersId,
      },
      context: {
        headers: {
          Authorization: await auth().getToken({ template: "testing" }),
        },
      },
    });

    // sort randomly posts
    const randomizedItems = [...data.getPostsOfGroupMembers.userAndPosts].sort(() => Math.random() - 0.5);
    return {
      items: randomizedItems,
      hasMore: data.getPostsOfGroupMembers.hasMore,
    };
  } catch (error) {
    handleApolloError(error);
    return {
      error: "Error al traer anuncios del grupo. Por favor intenta de nuevo.",
    };
  }
};

export const postGroup = async (formData: PostGroup) => {
  return await getClient()
    .mutate({
      mutation: createNewGroupMutation,
      variables: {
        groupDto: formData,
      },
      context: {
        headers: {
          Authorization: `${await auth().getToken({ template: "testing" })}`,
        },
      },
    })
    .then((res) => res.data.createNewGroup);
};

export const putGroup = async (groupToUpdate: any) => {
  try {
    const { data } = await getClient()
      .mutate({
        mutation: editGroupMutation,
        variables: { groupToUpdate },
        context: {
          headers: {
            Authorization: `${await auth().getToken({ template: "testing" })}`,
          },
        },
      })
      .then((res) => res);
    return {
      message: "Grupo editado exitosamente",
      id: data.updateGroupById,
    };
  } catch (error) {
    return handleApolloError(error);
  }
};

export const putNoteGroup = async (groupToUpdate: Pick<Group, "_id" | "groupNote">) => {
  try {
    const { data } = await getClient()
      .mutate({
        mutation: editGroupMutation,
        variables: { groupToUpdate },
        context: {
          headers: {
            Authorization: `${await auth().getToken({ template: "testing" })}`,
          },
        },
      })
      .then((res) => res);
    return {
      message: "Nota de grupo editada exitosamente",
    };
  } catch (error) {
    throw handleApolloError(error);
  }
};

export const groupAliasExists = async (alias: string) => {
  try {
    const { data } = await query({
      query: validateGroupAliasQuery,
      variables: { alias },
      context: {
        headers: {
          Authorization: await auth().getToken({ template: "testing" }),
        },
      },
    });
    return data.isThisGroupExist;
  } catch (error) {
    console.log(error);
    return {
      error: "Error al traer el grupo. Por favor intenta de nuevo.",
    };
  }
};

export const putAdminGroup = async (groupId: string, userId: string) => {
  const groupAdmin = auth().sessionClaims?.metadata.mongoId;
  try {
    await getClient().mutate({
      mutation: makeAdminMutation,
      variables: { groupId, newAdmin: userId, groupAdmin },
      context: {
        headers: {
          Authorization: await auth().getToken({ template: "testing" }),
        },
      },
    });
    return { message: "Administrador agregado" };
  } catch (error) {
    return handleApolloError(error);
  }
};

export const deleteMember = async (groupId: string, userIds: string[]) => {
  const groupAdmin = auth().sessionClaims?.metadata.mongoId;
  try {
    await getClient()
      .mutate({
        mutation: deleteMemberMutation,
        variables: { groupId, membersToDelete: userIds, groupAdmin },
        context: {
          headers: {
            Authorization: await auth().getToken({ template: "testing" }),
          },
        },
      })
      .then((res) => res);

    return { message: "Miembro eliminado" };
  } catch (error) {
    return handleApolloError(error);
  }
};

export const deleteAdmin = async (groupId: string, userIds: string[]) => {
  const groupCreator = auth().sessionClaims?.metadata.mongoId;
  try {
    await getClient()
      .mutate({
        mutation: deleteAdminMutation,
        variables: { groupId, adminsToDelete: userIds, groupCreator },
        context: {
          headers: {
            Authorization: `${await auth().getToken({ template: "testing" })}`,
          },
        },
      })
      .then((res) => res);

    return { message: "Administrador eliminado" };
  } catch (error) {
    return handleApolloError(error);
  }
};

export const deleteGroup = async (groupId: string) => {
  try {
    await getClient()
      .mutate({
        mutation: deleteGroupMutation,
        variables: {
          groupId,
          groupCreator: auth().sessionClaims?.metadata.mongoId,
        },
        context: {
          headers: {
            Authorization: `${await auth().getToken({ template: "testing" })}`,
          },
        },
      })
      .then((res) => res);
    return { message: "Grupo eliminado exitosamente" };
  } catch (error) {
    return handleApolloError(error);
  }
};

export const putMemberGroup = async (groupId: string) => {
  try {
    await getClient()
      .mutate({
        mutation: acceptGroupInvitationMutation,
        variables: {
          groupId,
        },
        context: {
          headers: {
            Authorization: `${await auth().getToken({ template: "testing" })}`,
          },
        },
      })
      .then((res) => res);
    return { message: "Has aceptado la invitación exitosamente" };
  } catch (error) {
    return handleApolloError(error);
  }
};

export const putMemberGroupByRequest = async (
  groupId: string,
  newMember: string
) => {
  const userId = auth().sessionClaims?.metadata.mongoId;
  try {
    await getClient()
      .mutate({
        mutation: acceptJoinRequestMutation,
        variables: {
          groupId,
          newMember,
          groupAdmin: userId,
        },
        context: {
          headers: {
            Authorization: `${await auth().getToken({ template: "testing" })}`,
          },
        },
      })
      .then((res) => res);
    return { message: "Has aceptado la solicitud exitosamente" };
  } catch (error) {
    return handleApolloError(error);
  }
};

export const putExitGroup = async (
  groupId: string,
  isCreator?: boolean,
  newCreator?: string
) => {
  const userId = auth().sessionClaims?.metadata.mongoId;
  const variables: {
    groupId: string;
    member?: string;
    creator?: string;
    newCreator?: string;
  } = {
    groupId,
  };

  if (isCreator) {
    variables.creator = userId;
    variables.newCreator = newCreator;
  } else {
    variables.member = userId;
  }
  try {
    await getClient()
      .mutate({
        mutation: exitGroupMutation,
        variables,
        context: {
          headers: {
            Authorization: `${await auth().getToken({ template: "testing" })}`,
          },
        },
      })
      .then((res) => res);
    return { message: "Has salido del grupo exitosamente" };
  } catch (error) {
    return handleApolloError(error);
  }
};
