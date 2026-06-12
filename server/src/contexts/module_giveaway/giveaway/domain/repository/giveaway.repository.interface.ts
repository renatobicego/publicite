import {
  GiveawayResponse,
  GiveawayWinnerResponse,
} from '../../application/adapter/dto/HTTP-RESPONSE/giveaway.response';

export interface GiveawayRepositoryInterface {
  registerParticipant(
    userId: string,
    giveawayId: string,
  ): Promise<GiveawayResponse>;
  getWinner(giveawayId: string): Promise<GiveawayWinnerResponse>;
  getParticipants(giveawayId: string): Promise<GiveawayResponse>;
}
