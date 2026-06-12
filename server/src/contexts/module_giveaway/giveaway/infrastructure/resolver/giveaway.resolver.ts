import { Inject, UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { ClerkAuthGuard } from 'src/contexts/module_shared/auth/clerk-auth/clerk.auth.guard';
import { GiveawayAdapterInterface } from '../../application/adapter/giveaway.adapter.interface';
import {
  GiveawayResponse,
  GiveawayWinnerResponse,
} from '../../application/adapter/dto/HTTP-RESPONSE/giveaway.response';

@Resolver()
export class GiveawayResolver {
  constructor(
    @Inject('GiveawayAdapterInterface')
    private readonly giveawayAdapter: GiveawayAdapterInterface,
  ) {}

  @Query(() => GiveawayResponse, {
    nullable: true,
    description: 'Obtener un sorteo con sus participantes y ganador',
  })
  @UseGuards(ClerkAuthGuard)
  async getParticipants(
    @Args('giveawayId', { type: () => String })
    giveawayId: string,
  ): Promise<GiveawayResponse> {
    try {
      return await this.giveawayAdapter.getParticipants(giveawayId);
    } catch (error: any) {
      throw error;
    }
  }

  @Mutation(() => GiveawayResponse, {
    description: 'Registrar un participante en un sorteo',
  })
  @UseGuards(ClerkAuthGuard)
  async registerParticipant(
    @Args('userId', { type: () => String })
    userId: string,
    @Args('giveawayId', { type: () => String })
    giveawayId: string,
  ): Promise<GiveawayResponse> {
    try {
      return await this.giveawayAdapter.registerParticipant(userId, giveawayId);
    } catch (error: any) {
      throw error;
    }
  }

  @Mutation(() => GiveawayWinnerResponse, {
    description: 'Elegir al azar un ganador entre los participantes del sorteo',
  })
  @UseGuards(ClerkAuthGuard)
  async getWinner(
    @Args('giveawayId', { type: () => String })
    giveawayId: string,
  ): Promise<GiveawayWinnerResponse> {
    try {
      return await this.giveawayAdapter.getWinner(giveawayId);
    } catch (error: any) {
      throw error;
    }
  }
}
