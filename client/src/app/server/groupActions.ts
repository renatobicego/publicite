"use server";
import { postGroup } from "@/services/groupsService";
import { currentUser } from "@clerk/nextjs/server";

export const createGroup = async (formData: any) => {
  const user = await currentUser();

  if (!user?.username) {
    return { error: "Usuario no autenticado. Por favor inicie sesión." };
  }

  try {
    const res = await postGroup(formData);
    if(res.error){
      return { error: res.error }
    }
    return { message: "Grupo creado exitosamente", id: res._id };
  } catch (err) {
    return {
      error: "Error al crear el grupo. Por favor intenta de nuevo.",
    };
  }
};
