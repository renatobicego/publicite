"use server";
import { postMagazine, putMagazine } from "@/services/magazineService";
import { currentUser } from "@clerk/nextjs/server";

export const createMagazine = async (formData: any) => {
  const user = await currentUser();

  if (!user?.username) {
    return { error: "Usuario no autenticado. Por favor inicie sesión." };
  }

  try {
    const resApi: any = await postMagazine(formData);
    return { message: "Revista creada exitosamente", id: resApi.createMagazine };
  } catch (err) {
    console.log(err)
    return {
      error: "Error al crear la revista. Por favor intenta de nuevo.",
    };
  }
};

export const editMagazine = async (formData: any) => {
  const user = await currentUser();

  if (!user?.username) {
    return { error: "Usuario no autenticado. Por favor inicie sesión." };
  }

  try {
    const resApi: any = await putMagazine(formData, user.publicMetadata.mongoId);
    return { message: "Revista editada exitosamente", id: resApi.updateMagazineById };
  } catch (err) {
    console.log(err)
    return {
      error: "Error al editar la revista. Por favor intenta de nuevo.",
    };
  }
};
