"use server";
import { getAuthToken } from "@/services/auth-token";
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
  ActiveUserRelation,
  EditBusinessProfileProps,
  EditPersonProfileProps,
  EditProfileProps,
  UserPreferences,
  UserType,
} from "@/types/userTypes";
import { auth, currentUser } from "@clerk/nextjs/server";

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
  board: Board;
  userPreferences: UserPreferences;
  activeRelations: ActiveUserRelation[];
}
export const getConfigData = async (user: {
  username?: string;
  id: string;
}) => {
  if (!user?.username) {
    return;
  }
  try {
    const token = await getAuthToken();
    if (!token) {
      return;
    }
    // Use Promise.all to fetch data concurrently
    const [userBoard, preferences] = await Promise.all([
      getBoardByUsername(user.id, token),
      getUserPreferences(user.username, token),
    ]);

    // Handle cases where the required data is missing or errored
    if (!preferences || preferences.error || !userBoard || userBoard.error) {
      return;
    }

    const configData: ConfigData = {
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
      activeRelations: [], // You can populate this based on your needs
    };

    return configData;
  } catch (error) {
    throw error;
  }
};

export const getSubscriptions = async (userId: string) => {
  try {
    const subscriptions = await getSubscriptionsOfUser(userId);
    // Handle cases where the required data is missing or errored
    if ("error" in subscriptions || (subscriptions as any).error) {
      return;
    }
    const accountType = subscriptions?.find(
      (subscription: Subscription) => !subscription.subscriptionPlan.isPack
    );
    const postsPacks =
      subscriptions?.filter(
        (subscription: Subscription) => subscription.subscriptionPlan.isPack
      ) || [];

    return { accountType, postsPacks };
  } catch (error) {
    throw error;
  }
};
