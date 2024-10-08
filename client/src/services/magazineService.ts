import { createMagazineMutation, getMagazineByIdQuery } from "@/graphql/magazineQueries";
import { getClient, query } from "@/lib/client";

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
  
export const postMagazine = async (formData: any) => { 
  const { data } =  await getClient().mutate({
    mutation: createMagazineMutation,
    variables: { magazineCreateRequest: formData },
  })
  return data
}