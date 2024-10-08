"use server";
import { postMagazine } from "@/services/magazineService";
import { currentUser } from "@clerk/nextjs/server";

export const createMagazine = async (formData: any) => {
  const user = await currentUser();

  if (!user?.username) {
    return { error: "Usuario no autenticado. Por favor inicie sesión." };
  }

  try {
    const resApi: any = await postMagazine(formData);
    console.log(resApi)
    return { message: "Revista creada exitosamente", id: resApi._id };
  } catch (err) {
    console.log(err)
    return {
      error: "Error al crear la revista. Por favor intenta de nuevo.",
    };
  }
};
