"use server";
import { postBoard, putBoard } from "@/services/boardServices";
import { auth } from "@clerk/nextjs/server";

export const createBoard = async (formData: any) => {
  const user = auth();

  if (!user.sessionId) {
    return { error: "Usuario no autenticado. Por favor inicie sesión." };
  }

  try {
    console.log("call action")
    const resApi: any = await postBoard(formData);
    if (resApi.status !== 200 && resApi.status !== 201) {
      return {
        error:
          "Error al crear la pizarra. Por favor intenta de nuevo. Error: " +
          resApi.data.message,
      };
    }
    return { message: "Pizarra creada exitosamente" };
  } catch (err) {
    return {
      error: "Error al crear la pizarra. Por favor intenta de nuevo.",
    };
  }
};

export const editBoard = async(id: string, formData: any) => {

  try {
    const res = await putBoard(id, formData);
    if(res.error){
      return { error: res.error }
    }
    return { message: "Pizarra editada exitosamente", id: "1" };
  } catch (err) {
    return {
      error: "Error al editar la pizarra. Por favor intenta de nuevo.",
    };
  }
}
