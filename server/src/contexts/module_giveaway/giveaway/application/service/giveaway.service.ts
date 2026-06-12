import { Inject } from '@nestjs/common';
import { GiveawayServiceInterface } from '../../domain/service/giveaway.service.interface';
import { GiveawayRepositoryInterface } from '../../domain/repository/giveaway.repository.interface';
import {
  GiveawayResponse,
  GiveawayWinnerResponse,
} from '../adapter/dto/HTTP-RESPONSE/giveaway.response';
import { MyLoggerService } from 'src/contexts/module_shared/logger/logger.service';

export class GiveawayService implements GiveawayServiceInterface {
  constructor(
    private readonly logger: MyLoggerService,
    @Inject('GiveawayRepositoryInterface')
    private readonly giveawayRepository: GiveawayRepositoryInterface,
  ) {}

  async registerParticipant(
    userId: string,
    giveawayId: string,
  ): Promise<GiveawayResponse> {
    try {
      this.logger.log(
        'Registering participant ' + userId + ' in giveaway: ' + giveawayId,
      );
      return await this.giveawayRepository.registerParticipant(
        userId,
        giveawayId,
      );
    } catch (error: any) {
      this.logger.error('Error registering participant', error);
      throw error;
    }
  }

  async getWinner(giveawayId: string): Promise<GiveawayWinnerResponse> {
    try {
      this.logger.log('Getting winner for giveaway: ' + giveawayId);
      return await this.giveawayRepository.getWinner(giveawayId);
    } catch (error: any) {
      this.logger.error('Error getting winner', error);
      throw error;
    }
  }

  async getParticipants(giveawayId: string): Promise<GiveawayResponse> {
    try {
      this.logger.log('Getting participants for giveaway: ' + giveawayId);
      return await this.giveawayRepository.getParticipants(giveawayId);
    } catch (error: any) {
      this.logger.error('Error getting participants', error);
      throw error;
    }
  }
}
