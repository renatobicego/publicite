import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { GiveawayRepositoryInterface } from '../../domain/repository/giveaway.repository.interface';
import {
  GiveawayResponse,
  GiveawayWinnerResponse,
} from '../../application/adapter/dto/HTTP-RESPONSE/giveaway.response';
import { GiveawayDocument } from '../schemas/giveaway.schema';
import { IUser } from 'src/contexts/module_user/user/infrastructure/schemas/user.schema';

export class GiveawayRepository implements GiveawayRepositoryInterface {
  constructor(
    @InjectModel('Giveaway')
    private readonly giveawayModel: Model<GiveawayDocument>,
    @InjectModel('User')
    private readonly userModel: Model<IUser>,
  ) {}

  async registerParticipant(
    userId: string,
    giveawayId: string,
  ): Promise<GiveawayResponse> {
    try {
      const giveaway = await this.giveawayModel.findById(giveawayId);

      // Si el sorteo no existe todavía, nace con este primer participante.
      if (!giveaway) {
        const created = await this.giveawayModel.create({
          _id: giveawayId,
          participants: [userId],
          winner: null,
        });
        return new GiveawayResponse(created);
      }

      // No permitir registrarse dos veces en el mismo sorteo.
      if (giveaway.participants.includes(userId)) {
        throw new ConflictException('Ya estás participando en este sorteo.');
      }

      giveaway.participants.push(userId);
      await giveaway.save();
      return new GiveawayResponse(giveaway);
    } catch (error: any) {
      throw error;
    }
  }

  async getParticipants(giveawayId: string): Promise<GiveawayResponse> {
    try {
      const giveaway = await this.giveawayModel.findById(giveawayId).lean();
      // Si el sorteo aún no existe, devolvemos uno vacío (sin persistir) para
      // que el front pueda renderizar la página antes del primer registro.
      if (!giveaway) {
        return new GiveawayResponse({
          _id: giveawayId,
          participants: [],
          winner: null,
        });
      }
      return new GiveawayResponse(giveaway);
    } catch (error: any) {
      throw error;
    }
  }

  async getWinner(giveawayId: string): Promise<GiveawayWinnerResponse> {
    try {
      const giveaway = await this.giveawayModel.findById(giveawayId);
      if (!giveaway) {
        throw new NotFoundException('El sorteo no existe.');
      }
      if (!giveaway.participants || giveaway.participants.length === 0) {
        throw new BadRequestException('El sorteo no tiene participantes.');
      }

      // Elegir un clerkId al azar entre los participantes.
      const randomIndex = Math.floor(
        Math.random() * giveaway.participants.length,
      );
      const winnerClerkId = giveaway.participants[randomIndex];

      // Resolver los datos del usuario ganador a partir de su clerkId.
      const user = await this.userModel
        .findOne({ clerkId: winnerClerkId })
        .select('clerkId username profilePhotoUrl')
        .lean();

      const winner = {
        userId: winnerClerkId,
        username: user?.username ?? 'Usuario',
        profilePhotoUrl: user?.profilePhotoUrl ?? null,
      };

      // Persistir el ganador en el sorteo.
      giveaway.winner = winner as any;
      await giveaway.save();

      return new GiveawayWinnerResponse(winner);
    } catch (error: any) {
      throw error;
    }
  }
}
