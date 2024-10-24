"use server";
import { getBoardByUsername } from "@/services/boardServices";
import { putBusinessProfileData } from "@/services/businessServices";
import { getSubscriptionsOfUser } from "@/services/subscriptionServices";
import {
  getUserPreferences,
  getUserProfileData,
  putUserProfileData,
} from "@/services/userServices";
import { Board } from "@/types/board";
import { Subscription } from "@/types/subscriptions";
import {
  EditBusinessProfileProps,
  EditPersonProfileProps,
  EditProfileProps,
  UserPreferences,
  UserType,
} from "@/types/userTypes";
import { currentUser, User } from "@clerk/nextjs/server";

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
      );
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

export const getProfileData = async (username?: string) => {
  if (!username) {
    return { error: "Usuario no autenticado. Por favor inicie sesión." };
  }
  return await getUserProfileData(username);
};

export interface ConfigData {
  accountType: Subscription;
  postsPacks: Subscription[];
  board: Board;
  userPreferences: UserPreferences;
}
export const getConfigData = async (user: User | null) => {
  if (!user?.username) {
    return { error: "Usuario no autenticado. Por favor inicie sesión." };
  }
  const userBoard = await getBoardByUsername(user?.username as string);
  const subscriptions = await getSubscriptionsOfUser(
    user?.publicMetadata.mongoId as string
  );
  const accountType = subscriptions.find(
    (subscription: Subscription) => !subscription.subscriptionPlan.isPostPack
  );
  const postsPacks = subscriptions.filter(
    (subscription: Subscription) => subscription.subscriptionPlan.isPostPack
  );
  const preferences = await getUserPreferences(user.username);
  if (!preferences || preferences.error || !userBoard || userBoard.error) {
    return {
      error: preferences.error || userBoard.error,
    };
  }
  const configData: ConfigData  = {
    accountType,
    postsPacks,
    board: userBoard.board
      ? {
          ...userBoard.board,
          user: {
            name: userBoard.name,
            username: userBoard.username,
            profilePhotoUrl: userBoard.profilePhotoUrl,
          },
        }
      : null,
    userPreferences: preferences,
  };
  return configData;
};
