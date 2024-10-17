"use server";
import {
  deleteMember,
  postGroup,
  putAdminGroup,
  putGroup,
} from "@/services/groupsService";
import { EditGroupInterface } from "@/types/userTypes";
import { currentUser } from "@clerk/nextjs/server";

export const createGroup = async (formData: any) => {
  const user = await currentUser();

  if (!user?.username) {
    return { error: "Usuario no autenticado. Por favor inicie sesión." };
  }

  try {
    const res = await postGroup(formData);
    if (res.error) {
      return { error: res.error };
    }
    return { message: "Grupo creado exitosamente", id: res._id };
  } catch (err) {
    return {
      error: "Error al crear el grupo. Por favor intenta de nuevo.",
    };
  }
};

export const editGroup = async (
  formData: EditGroupInterface,
  admins: string[]
) => {
  const user = await currentUser();

  if (!user?.username) {
    return { error: "Usuario no autenticado. Por favor inicie sesión." };
  }

  if (!admins.includes(user.publicMetadata.mongoId)) {
    return { error: "No puedes editar este grupo" };
  }

  try {
    const res = await putGroup({
      ...formData,
      admin: user.publicMetadata.mongoId,
    });
    return res;
  } catch (err) {
    return {
      error: "Error al crear el grupo. Por favor intenta de nuevo.",
    };
  }
};

export const addAdmin = async (groupId: string, userIds: string[]) => {
  try {
    const res = await putAdminGroup(groupId, userIds);
    if ("error" in res) {
      return { error: res.error };
    }
    return { message: "Administrador agregado" };
  } catch (err) {
    return {
      error:
        "Error al agregar administrador al grupo. Por favor intenta de nuevo.",
    };
  }
};

export const removeMember = async (
  groupId: string,
  membersToDelete: string[]
) => {
  try {
    const res = await deleteMember(groupId, membersToDelete);
    return res;
  } catch (err) {
    return {
      error:
        "Error al agregar administrador al grupo. Por favor intenta de nuevo.",
    };
  }
};
