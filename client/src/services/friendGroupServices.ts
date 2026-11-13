"use server";

import {
  createFriendGroupMutation,
  friendGroupByInviteCodeQuery,
  friendGroupCheckoutQuery,
  friendPlanOptionsQuery,
  inviteToFriendGroupMutation,
  joinFriendGroupByInviteCodeMutation,
  leaveFriendGroupMutation,
  myFriendGroupQuery,
  payFriendGroupMutation,
  regenerateFriendGroupInviteCodeMutation,
  removeFriendGroupMemberMutation,
  respondFriendGroupInvitationMutation,
} from "@/graphql/friendGroupQueries";
import { getClient } from "@/lib/client";
import {
  FriendGroup,
  FriendGroupPricing,
  FriendGroupPublic,
  FriendPlanOptions,
  MyFriendGroup,
} from "@/types/friendGroupTypes";
import { getProductionErrorMessage } from "@/utils/functions/productionErrorHandler";
import { getApiContext } from "./apiContext";
import { getAuthToken } from "./auth-token";

/*
Hacete Amigo. El usuario sale del token y el server decide el precio (plan en MP
con el descuento por cantidad); el cliente sólo manda el grupo y la tarjeta.
*/

type Result<T> = T | { error: string };

const authContext = async () =>
  (await getApiContext(false, await getAuthToken())).context;

const toError = (error: unknown, fallback: string) => {
  console.error(error);
  return { error: getProductionErrorMessage(error) ?? fallback };
};

const run = async <T>(
  action: () => Promise<T>,
  fallback: string
): Promise<Result<T>> => {
  try {
    return await action();
  } catch (error) {
    return toError(error, fallback);
  }
};

export const getFriendPlanOptions = async (): Promise<Result<FriendPlanOptions>> =>
  run(async () => {
    const { data } = await getClient().query({
      query: friendPlanOptionsQuery,
      context: (await getApiContext(true)).context,
      fetchPolicy: "no-cache",
    });
    return data.friendPlanOptions;
  }, "No pudimos traer los planes de Hacete Amigo.");

export const getMyFriendGroup = async (): Promise<Result<MyFriendGroup>> =>
  run(async () => {
    const { data } = await getClient().query({
      query: myFriendGroupQuery,
      context: await authContext(),
      fetchPolicy: "no-cache",
    });
    return data.myFriendGroup;
  }, "No pudimos traer tu grupo.");

/** Link público: funciona sin cuenta (token de no registrado). */
export const getFriendGroupByInviteCode = async (
  code: string
): Promise<Result<FriendGroupPublic>> =>
  run(async () => {
    const { data } = await getClient().query({
      query: friendGroupByInviteCodeQuery,
      variables: { code },
      context: (await getApiContext(true)).context,
      fetchPolicy: "no-cache",
    });
    return data.friendGroupByInviteCode;
  }, "Este link de invitación no existe o ya no sirve.");

export const getFriendGroupCheckout = async (
  groupId: string
): Promise<Result<FriendGroupPricing>> =>
  run(async () => {
    const { data } = await getClient().query({
      query: friendGroupCheckoutQuery,
      variables: { groupId },
      context: await authContext(),
      fetchPolicy: "no-cache",
    });
    return data.friendGroupCheckout;
  }, "Todavía no se puede pagar el grupo.");

const mutate = async <T>(
  mutation: any,
  variables: Record<string, any>,
  field: string,
  fallback: string
): Promise<Result<T>> =>
  run(async () => {
    const { data } = await getClient().mutate({
      mutation,
      variables,
      context: await authContext(),
    });
    return data[field] as T;
  }, fallback);

export const createFriendGroup = async (mpPreapprovalPlanId: string) =>
  mutate<FriendGroup>(
    createFriendGroupMutation,
    { mpPreapprovalPlanId },
    "createFriendGroup",
    "No pudimos armar el grupo."
  );

export const inviteToFriendGroup = async (groupId: string, userId: string) =>
  mutate<FriendGroup>(
    inviteToFriendGroupMutation,
    { groupId, userId },
    "inviteToFriendGroup",
    "No pudimos invitar a esa persona."
  );

export const respondFriendGroupInvitation = async (
  groupId: string,
  accept: boolean
) =>
  mutate<MyFriendGroup>(
    respondFriendGroupInvitationMutation,
    { groupId, accept },
    "respondFriendGroupInvitation",
    "No pudimos responder la invitación."
  );

export const joinFriendGroupByInviteCode = async (code: string) =>
  mutate<FriendGroup>(
    joinFriendGroupByInviteCodeMutation,
    { code },
    "joinFriendGroupByInviteCode",
    "No pudimos sumarte al grupo."
  );

export const regenerateFriendGroupInviteCode = async (groupId: string) =>
  mutate<FriendGroup>(
    regenerateFriendGroupInviteCodeMutation,
    { groupId },
    "regenerateFriendGroupInviteCode",
    "No pudimos cambiar el link."
  );

export const removeFriendGroupMember = async (groupId: string, userId: string) =>
  mutate<FriendGroup>(
    removeFriendGroupMemberMutation,
    { groupId, userId },
    "removeFriendGroupMember",
    "No pudimos sacar a esa persona."
  );

export const leaveFriendGroup = async (
  groupId: string
): Promise<{ ok: boolean } | { error: string }> => {
  const response = await mutate<boolean>(
    leaveFriendGroupMutation,
    { groupId },
    "leaveFriendGroup",
    "No pudimos sacarte del grupo."
  );
  return typeof response === "object" ? response : { ok: response };
};

export const payFriendGroup = async (input: {
  groupId: string;
  cardTokenId: string;
  payerEmail: string;
}) =>
  mutate<{ status: string; message: string }>(
    payFriendGroupMutation,
    { input },
    "payFriendGroup",
    "No pudimos procesar el pago. Por favor intentá de nuevo."
  );
