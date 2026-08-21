"use server";

import {
  createAvatarMutation,
  deleteAvatarMutation,
  getUserAvatarsQuery,
  updateAvatarMutation,
} from "@/graphql/avatarQueries";
import { getClient } from "@/lib/client";
import { Avatar, CreateAvatarInput, UpdateAvatarInput } from "@/types/avatarTypes";
import { handleApolloError } from "@/utils/functions/errorHandler";
import { getApiContext } from "./apiContext";

export const getUserAvatars = async (): Promise<
  Avatar[] | { error: string }
> => {
  try {
    const { context } = await getApiContext();
    const {
      data: { getUserAvatars: result },
    } = await getClient().query({
      query: getUserAvatarsQuery,
      context,
      fetchPolicy: "no-cache",
    });

    return result as Avatar[];
  } catch (error) {
    return handleApolloError(error);
  }
};

export const createAvatar = async (
  input: CreateAvatarInput
): Promise<Avatar | { error: string }> => {
  try {
    const { context } = await getApiContext();
    const {
      data: { createAvatar: result },
    } = await getClient().mutate({
      mutation: createAvatarMutation,
      variables: { input },
      context,
    });

    return result as Avatar;
  } catch (error) {
    return handleApolloError(error);
  }
};

export const updateAvatar = async (
  input: UpdateAvatarInput
): Promise<Avatar | { error: string }> => {
  try {
    const { context } = await getApiContext();
    const {
      data: { updateAvatar: result },
    } = await getClient().mutate({
      mutation: updateAvatarMutation,
      variables: { input },
      context,
    });

    return result as Avatar;
  } catch (error) {
    return handleApolloError(error);
  }
};

export const deleteAvatar = async (
  avatarId: string
): Promise<boolean | { error: string }> => {
  try {
    const { context } = await getApiContext();
    const {
      data: { deleteAvatar: result },
    } = await getClient().mutate({
      mutation: deleteAvatarMutation,
      variables: { avatarId },
      context,
    });

    return result as boolean;
  } catch (error) {
    return handleApolloError(error);
  }
};
