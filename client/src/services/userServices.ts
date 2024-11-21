"use server";
import {
  EditPersonProfileProps,
  UserPersonFormValues,
  UserPreferences,
} from "@/types/userTypes";
import { auth, currentUser } from "@clerk/nextjs/server";
import axios from "axios";
import { getClient, query } from "@/lib/client";
import getUserByUsernameQuery, {
  changeNotificationStatusMutation,
  getAllNotificationsQuery,
} from "@/graphql/userQueries";
import { ApolloError } from "@apollo/client";

const baseUrl = `${process.env.API_URL}/user/personal`;

export const postUserPerson = async (formData: UserPersonFormValues) => {
  return await axios.post(`${baseUrl}`, formData);
};

export const putUserProfileData = async (
  formData: EditPersonProfileProps,
  username: string
) => {
  return await axios.put(`${baseUrl}/${username}`, formData);
};

export const getUserProfileData = async (username: string) => {
  try {
    const res = await fetch(
      `${process.env.API_URL}/user/personal-data/${username}`,
      {
        headers: {
          Authorization: `Bearer ${await auth().getToken()}`,
        },
      }
    );

    return await res.json();
  } catch (error) {
    return {
      error:
        "Error al traer los datos personales del usuario. Por favor intenta de nuevo.",
    };
  }
};

export const changeUserPreferences = async (
  userPreferences: Partial<UserPreferences>
) => {
  const user = await currentUser();
  try {
    const { data, status } = await axios.put(
      `${process.env.API_URL}/user/user-preferences/${user?.username}`,
      userPreferences
    );
    if (status !== 200 && status !== 201) {
      return {
        error: "Error al cambiar las preferencias. Por favor intenta de nuevo.",
      };
    }
    return data;
  } catch (error) {
    console.log(error);
    return {
      error: "Error al cambiar las preferencias. Por favor intenta de nuevo.",
    };
  }
};

export const getUserPreferences = async (username: string) => {
  try {
    const res = await fetch(
      `${process.env.API_URL}/user/preferences/${username}`,
      {
        headers: {
          Authorization: `Bearer ${await auth().getToken()}`,
        },
      }
    );
    return await res.json();
  } catch (error) {
    console.log(error);
    return {
      error: "Error al traer las preferencias. Por favor intenta de nuevo.",
    };
  }
};

export const getUsers = async (searchTerm: string | null, page: number) => {
  try {
    const res = await fetch(
      `${process.env.API_URL}/user?user=${
        searchTerm ? searchTerm : ""
      }&limit=20&page=${page}`,
      {
        headers: {
          Authorization: `${await auth().getToken()}`,
        },
      }
    );
    const data = await res.json();
    return { items: data.user, hasMore: data.hasMore };
  } catch (error) {
    return {
      error: "Error al traer los usuarios. Por favor intenta de nuevo.",
    };
  }
};

export const getUserByUsername = async (username: string) => {
  try {
    const { data } = await query({
      query: getUserByUsernameQuery,
      variables: { username },
      context: {
        headers: {
          Authorization: await auth().getToken(),
        },
        fetchOptions: {
          next: { revalidate: 60 },
        },
      },
    });

    return data.findUserByUsername;
  } catch (error: ApolloError | any) {
    return {
      error:
        "Error al traer los datos del usuario. Por favor intenta de nuevo.",
    };
  }
};

type GetNotificationsResponse = {
  items: BaseNotification[];
  hasMore: boolean;
};

type ErrorResponse = {
  error: string;
};
export const getNotifications = async (
  page: number
): Promise<GetNotificationsResponse | ErrorResponse> => {
  const user = auth();

  if (!user.sessionId) {
    return { error: "Usuario no autenticado. Por favor inicie sesión." };
  }
  try {
    const { data } = await query({
      query: getAllNotificationsQuery,
      variables: {
        getAllNotificationsFromUserByIdId: user.sessionClaims.metadata.mongoId,
        limit: 10,
        page,
      },
      context: {
        headers: {
          Authorization: await auth().getToken(),
        },
      },
    });
    return {
      items: data.getAllNotificationsFromUserById.notifications || [],
      hasMore: data.getAllNotificationsFromUserById.hasMore,
    };
  } catch (error: ApolloError | any) {
    console.log(error);
    return {
      error: "Error al traer las notificaciones.",
    };
  }
};

export const putNotificationStatus = async (id: string) => {
  const { data } = await getClient().mutate({
    mutation: changeNotificationStatusMutation,
    variables: { notificationId: id, view: true },
    context: {
      headers: {
        Authorization: await auth().getToken(),
      },
    },
  });
  return data;
};
