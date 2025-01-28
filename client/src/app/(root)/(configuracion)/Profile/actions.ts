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
  UserRelations,
  UserType,
} from "@/types/userTypes";
import { auth, currentUser, User } from "@clerk/nextjs/server";

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
  activeRelations: UserRelations[];
}
export const getConfigData = async (user: {
  username?: string;
  id: string;
}) => {
  if (!user?.username) {
    return;
  }
  try {
    const token = await auth().getToken({ template: "testing" });
    // Use Promise.all to fetch data concurrently
    const [userBoard, subscriptions, preferences] = await Promise.all([
      getBoardByUsername(user.username, token),
      getSubscriptionsOfUser(user.id),
      getUserPreferences(user.username, token),
    ]);

    // Handle cases where the required data is missing or errored
    if (!preferences || preferences.error || !userBoard || userBoard.error) {
      return;
    }

    const accountType = subscriptions?.find(
      (subscription: Subscription) => !subscription.subscriptionPlan.isPack
    );
    const postsPacks =
      subscriptions?.filter(
        (subscription: Subscription) => subscription.subscriptionPlan.isPack
      ) || [];

    const configData: ConfigData = {
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
      activeRelations: [], // You can populate this based on your needs
    };

    return configData;
  } catch (error) {
    throw error;
  }
};
