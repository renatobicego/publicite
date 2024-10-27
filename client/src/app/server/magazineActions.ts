"use server";
import {
  postMagazine,
  postMagazineSection,
  putMagazine,
} from "@/services/magazineService";
import { auth } from "@clerk/nextjs/server";

export const createMagazine = async (formData: any) => {
  const user = auth();

  if (!user.sessionId) {
    return { error: "Usuario no autenticado. Por favor inicie sesión." };
  }

  try {
    const resApi: any = await postMagazine(formData);
    return {
      message: "Revista creada exitosamente",
      id: resApi.createMagazine,
    };
  } catch (err) {
    console.log(err);
    return {
      error: "Error al crear la revista. Por favor intenta de nuevo.",
    };
  }
};

export const editMagazine = async (formData: any) => {
  const user = auth();

  if (!user.sessionId) {
    return { error: "Usuario no autenticado. Por favor inicie sesión." };
  }

  try {
    const resApi: any = await putMagazine(
      formData,
      user.sessionClaims.metadata.mongoId
    );
    return {
      message: "Revista editada exitosamente",
      id: resApi.updateMagazineById,
    };
  } catch (err) {
    console.log(err);
    return {
      error: "Error al editar la revista. Por favor intenta de nuevo.",
    };
  }
};

export const createMagazineSection = async (
  sectionName: string,
  magazineId: string,
  groupId?: string
) => {
  const user = auth();

  if (!user.sessionId) {
    return { error: "Usuario no autenticado. Por favor inicie sesión." };
  }

  try {
    await postMagazineSection(
      sectionName,
      user.sessionClaims.metadata.mongoId,
      magazineId,
      groupId
    );
    return { message: "Sección creada exitosamente" };
  } catch (err) {
    console.log(err);
    return {
      error: "Error al crear la sección. Por favor intenta de nuevo.",
    };
  }
};
