"use server";

import { Giveaway, GiveawayWinner } from "@/types/sorteo";
import {
  ErrorResponse,
  handleApolloError,
} from "@/utils/functions/errorHandler";
import { getClient, query } from "@/lib/client";
import { getApiContext } from "./apiContext";
import { getAuthToken } from "./auth-token";
import {
  getParticipantsQuery,
  registerParticipantMutation,
  getWinnerMutation,
} from "@/graphql/sorteoQueries";

/**
 * GET participants - Trae el sorteo con sus participantes y ganador
 */
export const getGiveaway = async (
  giveawayId: string
): Promise<Giveaway | ErrorResponse> => {
  try {
    const tokenCache = await getAuthToken();
    const { context } = await getApiContext(true, tokenCache);
    const { data } = await query({
      query: getParticipantsQuery,
      variables: { giveawayId },
      context,
    });
    return data.getParticipants;
  } catch (error) {
    return handleApolloError(error);
  }
};

/**
 * POST registerParticipant - Registrar un usuario al sorteo
 */
export const registerParticipant = async (
  userId: string,
  giveawayId: string
): Promise<Giveaway | ErrorResponse> => {
  try {
    const tokenCache = await getAuthToken();
    const { context } = await getApiContext(false, tokenCache);
    const { data } = await getClient().mutate({
      mutation: registerParticipantMutation,
      variables: { userId, giveawayId },
      context,
    });
    return data.registerParticipant;
  } catch (error) {
    return handleApolloError(error);
  }
};

/**
 * POST getWinner - Elige un ganador al azar (admin)
 */
export const pickWinner = async (
  giveawayId: string
): Promise<GiveawayWinner | ErrorResponse> => {
  try {
    const tokenCache = await getAuthToken();
    const { context } = await getApiContext(false, tokenCache);
    const { data } = await getClient().mutate({
      mutation: getWinnerMutation,
      variables: { giveawayId },
      context,
    });
    return data.getWinner;
  } catch (error) {
    return handleApolloError(error);
  }
};
