"use server";
import { postBoard, putBoard } from "@/services/boardServices";
import { auth } from "@clerk/nextjs/server";

export const createBoard = async (formData: any) => {
  const user = auth();

  if (!user.sessionId) {
    return { error: "Usuario no autenticado. Por favor inicie sesión." };
  }

  return await postBoard(formData);
};

export const editBoard = async (id: string, formData: any) => {
  try {
    const res = await putBoard(id, formData);
    if (res.error) {
      return { error: res.error };
    }
    return { message: "Pizarra editada exitosamente", id: "1" };
  } catch (err) {
    return {
      error: "Error al editar la pizarra. Por favor intenta de nuevo.",
    };
  }
};
