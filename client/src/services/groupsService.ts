"use server";
import { getClient, query } from "@/lib/client";
import { mockedPetitions, mockedPosts } from "../utils/data/mockedData";
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

export const getGroups = async (searchTerm: string | null, page: number) => {
  try {
    const { data } = await query({
      query: getGroupsQuery,
      variables: { name: searchTerm ? searchTerm : "", limit: 20, page },
      context: {
        headers: {
          Authorization: await auth().getToken(),
        },
      },
    });
    return {
      items: data.getGroupByNameOrAlias.groups,
      hasMore: data.getGroupByNameOrAlias.hasMore,
    };
  } catch (error) {
    console.log(error);
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
          Authorization: await auth().getToken(),
        },
      },
    });
    const { getGroupById } = data;
    const { group, isMember, hasJoinRequest, hasGroupRequest } = getGroupById;

    return { group, isMember, hasJoinRequest, hasGroupRequest };
  } catch (error: ApolloError | any) {
    console.log(error);
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
          Authorization: await auth().getToken(),
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
          Authorization: await auth().getToken(),
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

export const getGroupPosts = async (page: number, groupId?: string) => {
  if (!groupId)
    return {
      error: "Error al traer anuncios del grupo. Por favor intenta de nuevo.",
    };
  try {
    const { data } = await query({
      query: getMemberPosts,
      variables: { getPostsOfGroupMembersId: groupId, limit: 30, page },
      context: {
        headers: {
          Authorization: await auth().getToken(),
        },
      },
    });
    const items = data.getPostsOfGroupMembers.userAndPosts.flatMap((user: any) => {
      const { posts, username, _id, profilePhotoUrl, name, lastName, } = user;
      // Map over posts to add the author property
      return posts.map((post: Post) => ({
        ...post, // Spread the existing properties of the post
        author: {
          _id,
          username,
          profilePhotoUrl,
          name,
          lastName,
        },
      }));
    });
    // sort randomly posts
    const randomizedItems = items.sort(() => Math.random() - 0.5);
    return {
      items: randomizedItems,
      hasMore: data.getPostsOfGroupMembers.hasMore,
    };
  } catch (error) {
    console.log(error)
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
      context: {
        headers: {
          Authorization: `${await auth().getToken()}`,
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
      })
      .then((res) => res);
    return {
      message: "Grupo editado exitosamente",
      id: data.updateGroupById,
    };
  } catch (error) {
    console.log(error);
    return {
      error: "Error al editar el grupo. Por favor intenta de nuevo.",
    };
  }
};

export const groupAliasExists = async (alias: string) => {
  try {
    const { data } = await query({
      query: validateGroupAliasQuery,
      variables: { alias },
      context: {
        headers: {
          Authorization: await auth().getToken(),
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

export const putAdminGroup = async (groupId: string, userIds: string[]) => {
  const groupAdmin = auth().sessionClaims?.metadata.mongoId;
  try {
    await getClient().mutate({
      mutation: makeAdminMutation,
      variables: { groupId, newAdmins: userIds, groupAdmin },
      context: {
        headers: {
          Authorization: await auth().getToken(),
        },
      },
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
        context: {
          headers: {
            Authorization: await auth().getToken(),
          },
        },
      })
      .then((res) => res);

    return { message: "Miembro eliminado" };
  } catch (error) {
    return {
      error: "Error al quitar miembro del grupo. Por favor intenta de nuevo.",
    };
  }
};

export const deleteAdmin = async (groupId: string, userIds: string[]) => {
  const groupAdmin = auth().sessionClaims?.metadata.mongoId;
  try {
    await getClient()
      .mutate({
        mutation: deleteAdminMutation,
        variables: { groupId, adminsToDelete: userIds, groupAdmin },
        context: {
          headers: {
            Authorization: `${await auth().getToken()}`,
          },
        },
      })
      .then((res) => res);

    return { message: "Administrador eliminado" };
  } catch (error) {
    console.log(error);
    return {
      error: "Error al eliminar administrador. Por favor intenta de nuevo.",
    };
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
            Authorization: `${await auth().getToken()}`,
          },
        },
      })
      .then((res) => res);
    return { message: "Grupo eliminado exitosamente" };
  } catch (error) {
    return {
      error: "Error al eliminar el grupo. Por favor intenta de nuevo.",
    };
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
            Authorization: `${await auth().getToken()}`,
          },
        },
      })
      .then((res) => res);
    return { message: "Has aceptado la invitación exitosamente" };
  } catch (error) {
    return {
      error: "Error al aceptar la invitación. Por favor intenta de nuevo.",
    };
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
            Authorization: `${await auth().getToken()}`,
          },
        },
      })
      .then((res) => res);
    return { message: "Has aceptado la solicitud exitosamente" };
  } catch (error) {
    return {
      error: "Error al aceptar la solicitud. Por favor intenta de nuevo.",
    };
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
            Authorization: `${await auth().getToken()}`,
          },
        },
      })
      .then((res) => res);
    return { message: "Has salido del grupo exitosamente" };
  } catch (error) {
    return {
      error: "Error al salir del grupo. Por favor intenta de nuevo.",
    };
  }
};
