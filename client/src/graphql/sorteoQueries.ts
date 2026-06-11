import { gql } from "@apollo/client";

export const getParticipantsQuery = gql`
  query GetParticipants($giveawayId: String!) {
    getParticipants(giveawayId: $giveawayId) {
      _id
      participants
      winner {
        _id
        username
        profilePhotoUrl
      }
    }
  }
`;

export const registerParticipantMutation = gql`
  mutation RegisterParticipant($userId: String!, $giveawayId: String!) {
    registerParticipant(userId: $userId, giveawayId: $giveawayId) {
      _id
      participants
    }
  }
`;

export const getWinnerMutation = gql`
  mutation GetWinner($giveawayId: String!) {
    getWinner(giveawayId: $giveawayId) {
      _id
      username
      profilePhotoUrl
    }
  }
`;
