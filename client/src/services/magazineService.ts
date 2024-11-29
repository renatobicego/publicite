"use server";
import {
  addPostMagazineGroupMutation,
  addPostMagazineUserMutation,
  changeSectionNameMutation,
  createMagazineMutation,
  createMagazineSectionMutation,
  deleteMagazineMutation,
  deletePostInSectionMutation,
  deleteSectionMutation,
  editMagazineMutation,
  exitMagazineMutation,
  getMagazineByIdQuery,
  getMagazinesQuery,
  getMagazineWithoutPostsByIdQuery,
} from "@/graphql/magazineQueries";
import { getClient, query } from "@/lib/client";
import { auth } from "@clerk/nextjs/server";

export const getMagazineById = async (id: string) => {
  try {
    const { data } = await query({
      query: getMagazineByIdQuery,
      variables: { getMagazineByMagazineIdId: id },
      context: {
        headers: {
          Authorization: await auth().getToken({ template: "testing" }),
        },
        fetchOptions: {
          cache: "no-cache"
        },
      },
    });
    return data.getMagazineByMagazineId;
  } catch (error) {
    console.log(error);
    return {
      error:
        "Error al traer los datos de la revista. Por favor intenta de nuevo.",
    };
  }
};
export const getMagazineWithoutPostsById = async (id: string) => {
  try {
    const { data } = await query({
      query: getMagazineWithoutPostsByIdQuery,
      variables: { getMagazineByMagazineIdId: id },
    });
    return data.getMagazineByMagazineId;
  } catch (error) {
    console.log(error)
    return {
      error:
        "Error al traer los datos de la revista. Por favor intenta de nuevo.",
    };
  }
};

export const postMagazine = async (formData: any) => {
  const { data } = await getClient().mutate({
    mutation: createMagazineMutation,
    variables: { magazineCreateRequest: formData },
    context: {
      headers: {
        Authorization: await auth().getToken({ template: "testing" }),
      },
    },
  });
  return data;
};

export const putMagazine = async (formData: any, userId: string, groupId?: string) => {
  const { data } = await getClient().mutate({
    mutation: editMagazineMutation,
    variables: { magazineUpdateRequest: formData, owner: userId, groupId },
    context: {
      headers: {
        Authorization: await auth().getToken({ template: "testing" }),
      },
    },
  });
  return data;
};

export const postMagazineSection = async (
  sectionName: string,
  userId: string,
  magazineId: string,
  groupId?: string
) => {
  const { data } = await getClient().mutate({
    mutation: createMagazineSectionMutation,
    variables: {
      magazineAdmin: userId,
      magazineId,
      section: { isFatherSection: false, title: sectionName },
      groupId,
    },
    context: {
      headers: {
        Authorization: await auth().getToken({ template: "testing" }),
      },
    },
  });
  return data;
};

export const editMagazineSection = async (
  newTitle: string,
  sectionId: string,
  ownerType: "user" | "group"
) => {
  const { data } = await getClient().mutate({
    mutation: changeSectionNameMutation,
    variables: {
      newTitle,
      sectionId,
      ownerType,
    },
    context: {
      headers: {
        Authorization: await auth().getToken({ template: "testing" }),
      },
    },
  });
  return data;
};

export const deleteMagazineSection = async (
  sectionId: string,
  magazineId: string,
  ownerType: "user" | "group",
  userId: string
) => {
  const { data } = await getClient().mutate({
    mutation: deleteSectionMutation,
    variables: {
      sectionIdsToDelete: [sectionId],
      magazineId,
      ...(ownerType === "user"
        ? { userMagazineAllowed: userId }
        : { allowedCollaboratorId: userId }),
    },
    context: {
      headers: {
        Authorization: await auth().getToken({ template: "testing" }),
      },
    },
  });
  return data;
};

export const getMagazinesOfUser = async () => {
  const authData = auth();
  const { data } = await query({
    query: getMagazinesQuery,
    variables: { userId: authData.sessionClaims?.metadata.mongoId },
    context: {
      headers: {
        Authorization: await authData.getToken({ template: "testing" }),
      },
    },
  });
  return data.getAllMagazinesByUserId;
};

export const putPostInMagazine = async (
  magazineId: string,
  postId: string,
  sectionId: string,
  ownerType: "user" | "group"
) => {
  const magazineAdmin = auth().sessionClaims?.metadata.mongoId;
  await getClient().mutate({
    mutation:
      ownerType === "user"
        ? addPostMagazineUserMutation
        : addPostMagazineGroupMutation,
    variables: { postId, magazineAdmin, magazineId, sectionId },
    context: {
      headers: {
        Authorization: await auth().getToken({ template: "testing" }),
      },
    },
  });
};

export const deletPostInMagazine = async (
  magazineId: string,
  postIdToRemove: string,
  sectionId: string,
  ownerType: "user" | "group"
) => {
  await getClient().mutate({
    mutation: deletePostInSectionMutation,
    variables: { postIdToRemove, ownerType, magazineId, sectionId },
    context: {
      headers: {
        Authorization: await auth().getToken({ template: "testing" }),
      },
    },
  });
};

export const deleteMagazine = async (
  magazineId: string,
  ownerType: "user" | "group"
) => {
  const { data } = await getClient().mutate({
    mutation: deleteMagazineMutation,
    variables: { magazineId, ownerType },
    context: {
      headers: {
        Authorization: await auth().getToken({ template: "testing" }),
      },
    },
  });
  return data;
};

export const putExitMagazine = async (magazineId: string, ownerType: "user" | "group") => {
  const { data } = await getClient().mutate({
    mutation: exitMagazineMutation,
    variables: { magazineId, ownerType },
    context: {
      headers: {
        Authorization: await auth().getToken({ template: "testing" }),
      },
    },
  });
  return data;
};

// export const deleteCollaboratorFromUserMagazine = async (
//   collaboratorsToDelete: string[],
//   magazineId: string
// ) => {
//   const authData = auth();
//   await getClient().mutate({
//     mutation: deleteCollaboratorMutation,
//     variables: {
//       collaboratorsToDelete,
//       magazineId,
//       magazineAdmin: authData.sessionClaims?.metadata.mongoId,
//     },
//     context: {
//       headers: {
//         Authorization: await authData.getToken({ template: "testing" }),
//       },
//     },
//   });
// };

// export const deleteCollaboratorFromGroupMagazine = async (
//   allowedCollaboratorsToDelete: string[],
//   magazineId: string
// ) => {
//   const authData = auth();
//   await getClient().mutate({
//     mutation: deleteAllowedCollaboratorMutation,
//     variables: {
//       allowedCollaboratorsToDelete,
//       magazineId,
//       magazineAdmin: authData.sessionClaims?.metadata.mongoId,
//     },
//     context: {
//       headers: {
//         Authorization: await authData.getToken({ template: "testing" }),
//       },
//     },
//   });
// };
