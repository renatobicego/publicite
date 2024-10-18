import {
  createMagazineMutation,
  editMagazineMutation,
  getMagazineByIdQuery,
  getMagazineWithoutPostsByIdQuery,
} from "@/graphql/magazineQueries";
import { getClient, query } from "@/lib/client";
import { cookies } from "next/headers";

export const getMagazineById = async (id: string) => {
  try {
    const { data } = await query({
      query: getMagazineByIdQuery,
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
        Cookie: cookies().toString(),
      },
    }
  });
  return data;
};
