"use server";
import { putBusinessProfileData } from "@/services/businessServices";
import {
  getUserProfileData,
  putUserProfileData,
} from "@/services/userServices";
import {
  EditBusinessProfileProps,
  EditPersonProfileProps,
  EditProfileProps,
  UserType,
} from "@/types/userTypes";
import { currentUser } from "@clerk/nextjs/server";

export const editProfile = async (
  formData: EditProfileProps,
  userType: UserType
) => {
  const user = await currentUser();

  if (!user?.username) {
    return { error: "Usuario no autenticado. Por favor inicie sesión." };
  }

  try {
    if (userType === "Person") {
      const resApi = await putUserProfileData(
        formData as EditPersonProfileProps,
        user.username
      );
      if (resApi.status !== 200 && resApi.status !== 201) {
        return {
          error:
            "Error al completar el registro. Por favor intenta de nuevo. Error: " +
            resApi.data.message,
        };
      }
      return { message: "Usuario editado exitosamente" };
    } else if (userType === "Business") {
      const resApi = await putBusinessProfileData(
        formData as EditBusinessProfileProps,
        user.username
      )
      if (resApi.status !== 200 && resApi.status !== 201) {
        return {
          error:
            "Error al completar el registro. Por favor intenta de nuevo. Error: " +
            resApi.data.message,
        };
      }
      return { message: "Usuario editado exitosamente" };
    }
  } catch (err) {
    return {
      error: "Error al completar el registro. Por favor intenta de nuevo.",
    };
  }
};

export const getProfileData = async () => {
  const user = await currentUser();
  if (!user?.username) {
    return { error: "Usuario no autenticado. Por favor inicie sesión." };
  }
  return await getUserProfileData(user.username);
};
