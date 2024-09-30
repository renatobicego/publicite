"use server";
import { postBoard } from "@/services/boardServices";
import { currentUser } from "@clerk/nextjs/server";

export const createBoard = async (formData: any) => {
  const user = await currentUser();

  if (!user?.username) {
    return { error: "Usuario no autenticado. Por favor inicie sesión." };
  }

  try {
    const resApi: any = await postBoard(formData);
    console.log(resApi);
    if (resApi.status !== 200 && resApi.status !== 201) {
      return {
        error:
          "Error al crear la pizarra. Por favor intenta de nuevo. Error: " +
          resApi.data.message,
      };
    }
    return { message: "Pizarra creada exitosamente", id: "1" };
  } catch (err) {
    return {
      error: "Error al crear la pizarra. Por favor intenta de nuevo.",
    };
  }
};
