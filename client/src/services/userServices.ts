"use server";
import {
  Contact,
  EditPersonProfileProps,
  GetUser,
  UserPersonFormValues,
  UserPreferences,
  UserRelationNotification,
  UserRelations,
} from "@/types/userTypes";
import { auth, currentUser } from "@clerk/nextjs/server";
import axios from "axios";
import { getClient, query } from "@/lib/client";
import getUserByIdQuery, {
  changeNotificationStatusMutation,
  deleteNotificationMutation,
  deleteUserRelationMutation,
  getAllNotificationsQuery,
  getContactSellersByTypeQuery,
  getFriendRequestsQuery,
  getFriendsQuery,
  putActiveRelationsMutation,
  updateContactMutation,
} from "@/graphql/userQueries";
import { ApolloError } from "@apollo/client";
import { getApiContext } from "./apiContext";
import { handleApolloError } from "@/utils/functions/errorHandler";
import { GetContactSellersPetitionDTO } from "@/types/postTypes";
import { getAuthToken } from "./auth-token";

const baseUrl = `${process.env.API_URL}/user/personal`;

export const postUserPerson = async (formData: UserPersonFormValues) => {
  return await axios.post(`${baseUrl}`, formData);
};

export const putUserProfileData = async (
  formData: EditPersonProfileProps,
  username: string
) => {
  return await axios.put(`${baseUrl}/${username}`, formData, {
    headers: {
      Authorization: `Bearer ${await getAuthToken()}`,
    },
  });
};

export const putContactData = async (
  contactId: string,
  contactData: Omit<Contact, "_id">
) => {
  try {
    await getClient().mutate({
      mutation: updateContactMutation,
      variables: { contactId, updateRequest: contactData },
      context: {
        headers: {
          Authorization: await getAuthToken(),
        },
      },
    });
    return { message: "Contacto actualizado" };
  } catch (error) {
    return {
      error: "Error al actualizar el contacto. Por favor intenta de nuevo.",
    };
  }
};

export const getUserProfileData = async (username: string) => {
  try {
    const res = await fetch(
      `${process.env.API_URL}/user/personal-data/${username}`,
      {
        headers: {
          Authorization: `Bearer ${await auth().getToken({
            template: "testing",
          })}`,
        },
        cache: "no-cache",
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

export const getFriendsOfUser = async (id: string) => {
  try {
    const user = auth();
    const {
      data,
    }: { data: { findUserById: { userRelations: UserRelations[] } } } =
      await query({
        query: getFriendsQuery,
        variables: { id },
        context: {
          headers: {
            Authorization: await user.getToken({ template: "testing" }),
          },
        },
      });
    if (!data.findUserById) return [];

    const relationsMapped = data.findUserById.userRelations.map((relation) => {
      if (relation.userA._id === user.sessionClaims?.metadata.mongoId) {
        return relation.userB;
      }
      return relation.userA;
    });

    return relationsMapped;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const changeUserPreferences = async (
  userPreferences: Partial<UserPreferences>
) => {
  const user = await currentUser();
  try {
    const { data, status } = await axios.put(
      `${process.env.API_URL}/user/user-preferences/${user?.username}`,
      userPreferences,
      {
        headers: {
          Authorization: `Bearer ${await auth().getToken({
            template: "testing",
          })}`,
        },
      }
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

export const getUserPreferences = async (
  username: string,
  token?: string | null
) => {
  try {
    const res = await fetch(
      `${process.env.API_URL}/user/preferences/${username}`,
      {
        headers: {
          Authorization: `Bearer ${
            token ||
            (await auth().getToken({
              template: "testing",
            }))
          }`,
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
          Authorization: `${await getAuthToken()}`,
        },
      }
    );
    const data = await res.json();
    return { items: data.user, hasMore: data.hasMore };
  } catch (error) {
    return {};
  }
};

export const getUserById = async (
  id: string
): Promise<
  | (GetUser & {
      isFriendRequestPending: boolean;
      isAcceptRequestFriend?: {
        notification_id: string;
        type:
          | "notification_user_new_friend_request"
          | "notification_user_new_relation_change";
        value: boolean;
        userRelationId: string;
        toRelationShipChange: UserRelation;
        newRelation: UserRelation;
      };
    })
  | { error: string }
> => {
  try {
    const tokenCache = await getAuthToken();
    const { context } = await getApiContext(false, tokenCache);
    const { data } = await query({
      query: getUserByIdQuery,
      variables: { id },
      context,
    });
    return data.findUserById;
  } catch (error: ApolloError | any) {
    console.log(error);
    return {
      error:
        "Error al traer los datos del usuario. Por favor intenta de nuevo.",
    };
  }
};

export const getFriendRequests = async (
  id: string
): Promise<UserRelationNotification[] | { error: string }> => {
  try {
    const tokenCache = await getAuthToken();
    const { context } = await getApiContext(false, tokenCache);

    const { data } = await query({
      query: getFriendRequestsQuery,
      variables: { id },
      context,
    });

    return data.findUserById.friendRequests;
  } catch (error: ApolloError | any) {
    return {
      error:
        "Error al traer las solicitudes de amistad del usuario. Por favor intenta de nuevo.",
    };
  }
};

export const getContactSellers = async (
  type: "post" | "profile",
  id: string,
  page: number
): Promise<
  | { contactSeller: GetContactSellersPetitionDTO[]; hasMore: boolean }
  | { error: string }
> => {
  try {
    const token = await getAuthToken();
    const { data } = await query({
      query: getContactSellersByTypeQuery,
      variables: { contactSellerGetType: type, id, page, limit: 20 },
      context: {
        headers: {
          Authorization: token,
        },
      },
    });
    return data.getContactSellerById;
  } catch (error: ApolloError | any) {
    return handleApolloError(error);
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
    return {
      items: [],
      hasMore: false,
    };
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
          Authorization: await user.getToken({ template: "testing" }),
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

export const putNotificationStatus = async (id: string[]) => {
  try {
    if (id.length === 0) return;
    const { data } = await getClient().mutate({
      mutation: changeNotificationStatusMutation,
      variables: { notificationIds: id, view: true },
      context: {
        headers: {
          Authorization: await getAuthToken(),
        },
      },
    });
    return data;
  } catch (error) {
    console.log(error);
  }
};

export const deleteNotificationById = async (event: string, id: string) => {
  try {
    await getClient().mutate({
      mutation: deleteNotificationMutation,
      variables: { event, id },
      context: {
        headers: {
          Authorization: await getAuthToken(),
        },
      },
    });
    return {
      message: "Notificacion eliminada",
    };
  } catch (error) {
    return handleApolloError(error);
  }
};

export const deleteUserRelation = async (relationId: string) => {
  try {
    await getClient().mutate({
      mutation: deleteUserRelationMutation,
      variables: { relationId },
      context: {
        headers: {
          Authorization: await getAuthToken(),
        },
      },
    });
    return { message: "Relacion eliminada" };
  } catch (error) {
    return {
      error: "Error al eliminar la relacion. Por favor intenta de nuevo.",
    };
  }
};

export const putActiveRelations = async (activeRelations: string[]) => {
  try {
    const tokenCache = await getAuthToken();
    const { context } = await getApiContext(false, tokenCache);
    const { data } = await getClient().mutate({
      mutation: putActiveRelationsMutation,
      variables: { activeRelations },
      context,
    });
    console.log(data);
    return data;
  } catch (error) {
    return handleApolloError(error);
  }
};
