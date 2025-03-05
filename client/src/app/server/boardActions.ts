"use server";
import { postBoard, putBoard } from "@/services/boardServices";
import { auth } from "@clerk/nextjs/server";

export const createBoard = async (formData: any) => {
  const user = auth();

  if (!user.sessionId) {
    return { error: "Usuario no autenticado. Por favor inicie sesión." };
  }

  const res = await postBoard(formData);

  if (res.error) {
    return { error: res.error };
  }

  return { message: "Pizarra creada exitosamente.", updatedData: res };
};

export const editBoard = async (id: string, formData: any) => {
  const res = await putBoard(id, formData);
  if (res.error) {
    return res
  }
  return { message: "Pizarra editada exitosamente.", updatedData: res };
};


