"use server";

import { Giveaway, GiveawayWinner } from "@/types/sorteo";
import {
  ErrorResponse,
  handleApolloError,
} from "@/utils/functions/errorHandler";

// ============================================================
// MOCK DATA - Reemplazar con llamadas a GraphQL cuando esté el BE
// ============================================================

const MOCK_GIVEAWAY: Giveaway = {
  _id: "sorteo-lentes-afa-2026",
  participants: ["user1", "user2", "user3", "user4", "user5"],
  winner: null,
};

// Para testear con ganador, descomentar:
// const MOCK_GIVEAWAY: Giveaway = {
//   _id: "sorteo-lentes-afa-2026",
//   participants: ["user1", "user2", "user3", "user4", "user5"],
//   winner: {
//     _id: "user3",
//     username: "Juan Pérez",
//     profilePhotoUrl: "/avatar.png",
//   },
// };

// No se puede exportar una constante desde "use server", la movemos a un archivo aparte
// Usar import { CURRENT_GIVEAWAY_ID } from "@/utils/data/sorteoConfig"

/**
 * GET participants - Trae los participantes de un sorteo
 */
export const getGiveaway = async (
  giveawayId: string
): Promise<Giveaway | ErrorResponse> => {
  try {
    // TODO: Cuando esté el BE, descomentar esto:
    // const tokenCache = await getAuthToken();
    // const { context } = await getApiContext(true, tokenCache);
    // const { data } = await query({
    //   query: getParticipantsQuery,
    //   variables: { giveawayId },
    //   context,
    // });
    // return data.getParticipants;

    // MOCK
    return MOCK_GIVEAWAY;
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
    // TODO: Cuando esté el BE, descomentar esto:
    // const tokenCache = await getAuthToken();
    // const { context } = await getApiContext(false, tokenCache);
    // const { data } = await getClient().mutate({
    //   mutation: registerParticipantMutation,
    //   variables: { userId, giveawayId },
    //   context,
    // });
    // return data.registerParticipant;

    // MOCK
    if (MOCK_GIVEAWAY.participants.includes(userId)) {
      return { error: "Ya estás participando en este sorteo." };
    }
    MOCK_GIVEAWAY.participants.push(userId);
    return MOCK_GIVEAWAY;
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
    // TODO: Cuando esté el BE, descomentar esto:
    // const tokenCache = await getAuthToken();
    // const { context } = await getApiContext(false, tokenCache);
    // const { data } = await getClient().mutate({
    //   mutation: getWinnerMutation,
    //   variables: { giveawayId },
    //   context,
    // });
    // return data.getWinner;

    // MOCK
    const randomIndex = Math.floor(
      Math.random() * MOCK_GIVEAWAY.participants.length
    );
    const winnerId = MOCK_GIVEAWAY.participants[randomIndex];
    const winner: GiveawayWinner = {
      _id: winnerId,
      username: "Juan Pérez",
      profilePhotoUrl: "/avatar.png",
    };
    MOCK_GIVEAWAY.winner = winner;
    return winner;
  } catch (error) {
    return handleApolloError(error);
  }
};
