"use server";
import {
  deleteMagazine,
  deleteMagazineSection,
  deletPostInMagazine,
  editMagazineSection,
  postMagazine,
  postMagazineSection,
  putExitMagazine,
  putMagazine,
  putPostInMagazine,
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

export const editMagazine = async (formData: any, groupId?: string) => {
  const user = auth();

  if (!user.sessionId) {
    return { error: "Usuario no autenticado. Por favor inicie sesión." };
  }

  try {
    const resApi: any = await putMagazine(
      formData,
      user.sessionClaims.metadata.mongoId,
      groupId
      
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

export const putMagazineSection = async (
  newTitle: string,
  sectionId: string,
  ownerType: "user" | "group"
) => {
  const user = auth();

  if (!user.sessionId) {
    return { error: "Usuario no autenticado. Por favor inicie sesión." };
  }

  try {
    await editMagazineSection(newTitle, sectionId, ownerType);
    return { message: "Sección editada exitosamente" };
  } catch (err) {
    console.log(err);
    return {
      error: "Error al editar la sección. Por favor intenta de nuevo.",
    };
  }
};

export const deleteSection = async (
  sectionId: string,
  magazineId: string,
  ownerType: "user" | "group"
) => {
  const user = auth();

  if (!user.sessionId) {
    return { error: "Usuario no autenticado. Por favor inicie sesión." };
  }

  try {
    await deleteMagazineSection(
      sectionId,
      magazineId,
      ownerType,
      user.sessionClaims.metadata.mongoId
    );
    return { message: "Sección eliminada exitosamente" };
  } catch (err) {
    console.log(err);
    return {
      error: "Error al eliminar la sección. Por favor intenta de nuevo.",
    };
  }
};

export const addPostToMagazine = async (
  magazineId: string,
  postId: string,
  sectionId: string,
  ownerType: "user" | "group"
) => {
  try {
    await putPostInMagazine(magazineId, postId, sectionId, ownerType);
    return { message: "Anuncio agregado exitosamente" };
  } catch (error) {
    console.log(error);
    return {
      error: "Error al agregar el anuncio. Por favor intenta de nuevo.",
    };
  }
};

export const removePostInMagazineSection = async (
  magazineId: string,
  postIdToRemove: string,
  sectionId: string,
  ownerType: "user" | "group"
) => {
  try {
    await deletPostInMagazine(magazineId, postIdToRemove, sectionId, ownerType);
    return { message: "Anuncio removido exitosamente" };
  } catch (error) {
    console.log(error);
    return {
      error: "Error al remover el anuncio. Por favor intenta de nuevo.",
    };
  }
};

export const removeMagazine = async (
  magazineId: string,
  ownerType: "user" | "group"
) => {
  try {
    await deleteMagazine(magazineId, ownerType);
    return { message: "Revista eliminada exitosamente" };
  } catch (error) {
    console.log(error);
    return {
      error: "Error al eliminar la revista. Por favor intenta de nuevo.",
    };
  }
};

export const exitMagazine = async (magazineId: string, ownerType: "user" | "group") => {
  try {
    await putExitMagazine(magazineId, ownerType);
    return { message: "Has salido exitosamente" };
  } catch (error) {
    console.log(error);
    return {
      error: "Error al salir de la revista. Por favor intenta de nuevo.",
    };
  }
};

// export const deleteCollaborator = async (collaboratorIds: string[], magazineId: string,  ownerType: "user" | "group") => {
//   if (ownerType === "user") {
//     try {
//       await deleteCollaboratorFromUserMagazine(collaboratorIds, magazineId);
//       return { message: "Colaborador eliminado exitosamente" };
//     } catch (error) {
//       console.log(error);
//       return {
//         error: "Error al eliminar el colaborador. Por favor intenta de nuevo.",
//       };
//     }
//   }else if (ownerType === "group") {
//     try {
//       await deleteCollaboratorFromGroupMagazine(collaboratorIds, magazineId);
//       return { message: "Colaborador eliminado exitosamente" };
//     } catch (error) {
//       console.log(error);
//       return {
//         error: "Error al eliminar el colaborador. Por favor intenta de nuevo.",
//       };
//     }
//   }
// };
