"use server";
import {
  addPostMagazineGroupMutation,
  addPostMagazineUserMutation,
  createMagazineMutation,
  createMagazineSectionMutation,
  deletePostInSectionMutation,
  editMagazineMutation,
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
  });
  return data;
};

export const putMagazine = async (formData: any, userId: string) => {
  const { data } = await getClient().mutate({
    mutation: editMagazineMutation,
    variables: { magazineUpdateRequest: formData, owner: userId },
    context: {
      headers: {
        Authorization: await auth().getToken(),
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
        Authorization: await auth().getToken(),
      },
    },
  });
  return data;
};

export const getMagazinesOfUser = async () => {
  const userId = auth().sessionClaims?.metadata.mongoId;
  const { data } = await query({
    query: getMagazinesQuery,
    variables: { userId },
    context: {
      headers: {
        Authorization: await auth().getToken(),
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
    variables: { postId: [postId], magazineAdmin, magazineId, sectionId },
    context: {
      headers: {
        Authorization: await auth().getToken(),
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
        Authorization: await auth().getToken(),
      },
    },
  });
};
