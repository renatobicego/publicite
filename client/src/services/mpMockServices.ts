"use server";

import gql from "graphql-tag";

import { getClient } from "@/lib/client";
import { getProductionErrorMessage } from "@/utils/functions/productionErrorHandler";
import { getApiContext } from "./apiContext";
import { getAuthToken } from "./auth-token";

/*
Simulador de avisos de MercadoPago (sólo desarrollo local, con MP simulado en
el server). Hace lo que haría el webhook: cobro rechazado, recuperado, débito
cancelado o devolución de un regalo.
*/

const friendGroupEventMutation = gql`
  mutation MpMockFriendGroupEvent($groupId: ID!, $event: String!) {
    mpMockFriendGroupEvent(groupId: $groupId, event: $event)
  }
`;

const refundGiftMutation = gql`
  mutation MpMockRefundGift($giftId: ID!) {
    mpMockRefundGift(giftId: $giftId)
  }
`;

export type MpMockFriendGroupEvent =
  | "charge_failed"
  | "charge_recovered"
  | "payment_failed_expired"
  | "cancelled_in_mp";

const run = async (
  mutation: any,
  variables: Record<string, string>
): Promise<{ ok: true } | { error: string }> => {
  try {
    const { context } = await getApiContext(false, await getAuthToken());
    await getClient().mutate({ mutation, variables, context });
    return { ok: true };
  } catch (error) {
    return { error: getProductionErrorMessage(error) ?? "No se pudo simular el aviso." };
  }
};

export const mpMockFriendGroupEvent = async (
  groupId: string,
  event: MpMockFriendGroupEvent
) => run(friendGroupEventMutation, { groupId, event });

export const mpMockRefundGift = async (giftId: string) =>
  run(refundGiftMutation, { giftId });
