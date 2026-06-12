import {
  GiveawayResponse,
  GiveawayWinnerResponse,
} from './dto/HTTP-RESPONSE/giveaway.response';

export interface GiveawayAdapterInterface {
  registerParticipant(
    userId: string,
    giveawayId: string,
  ): Promise<GiveawayResponse>;
  getWinner(giveawayId: string): Promise<GiveawayWinnerResponse>;
  getParticipants(giveawayId: string): Promise<GiveawayResponse>;
}
