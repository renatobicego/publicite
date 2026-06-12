import { Inject } from '@nestjs/common';
import { GiveawayAdapterInterface } from '../../../application/adapter/giveaway.adapter.interface';
import { GiveawayServiceInterface } from '../../../domain/service/giveaway.service.interface';
import {
  GiveawayResponse,
  GiveawayWinnerResponse,
} from '../../../application/adapter/dto/HTTP-RESPONSE/giveaway.response';

export class GiveawayAdapter implements GiveawayAdapterInterface {
  constructor(
    @Inject('GiveawayServiceInterface')
    private readonly giveawayService: GiveawayServiceInterface,
  ) {}

  async registerParticipant(
    userId: string,
    giveawayId: string,
  ): Promise<GiveawayResponse> {
    try {
      return await this.giveawayService.registerParticipant(userId, giveawayId);
    } catch (error: any) {
      throw error;
    }
  }

  async getWinner(giveawayId: string): Promise<GiveawayWinnerResponse> {
    try {
      return await this.giveawayService.getWinner(giveawayId);
    } catch (error: any) {
      throw error;
    }
  }

  async getParticipants(giveawayId: string): Promise<GiveawayResponse> {
    try {
      return await this.giveawayService.getParticipants(giveawayId);
    } catch (error: any) {
      throw error;
    }
  }
}
