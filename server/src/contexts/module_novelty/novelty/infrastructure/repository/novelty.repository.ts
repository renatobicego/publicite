import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { NoveltyRepositoryInterface } from '../../domain/repository/novelty.repository.interface';
import { NoveltyEntity } from '../../domain/entity/novelty.entity';
import { NoveltyResponse } from '../../application/adapter/dto/HTTP-RESPONSE/novelty.response';
import { NoveltyDocument } from '../schemas/novelty.schema';
import { NoveltyUpdateRequest } from '../../application/adapter/dto/HTTP-REQUEST/novelty.update.request';

export class NoveltyRepository implements NoveltyRepositoryInterface {
  constructor(
    @InjectModel('Novelty')
    private readonly noveltyModel: Model<NoveltyDocument>,
  ) {}

  async createNovelty(novelty: NoveltyEntity): Promise<NoveltyResponse> {
    try {
      const noveltySaved = await new this.noveltyModel(novelty).save();
      return new NoveltyResponse(noveltySaved);
    } catch (error: any) {
      throw error;
    }
  }

  async getNoveltyById(id: string): Promise<NoveltyResponse | null> {
    try {
      const novelty = await this.noveltyModel.findById(id).lean();
      if (!novelty) {
        return null;
      }
      return new NoveltyResponse(novelty);
    } catch (error: any) {
      throw error;
    }
  }

  async getAllNovelties(): Promise<NoveltyResponse[]> {
    try {
      const novelties = await this.noveltyModel
        .find()
        .sort({ createdAt: -1 })
        .lean();
      return novelties.map((novelty) => new NoveltyResponse(novelty));
    } catch (error: any) {
      throw error;
    }
  }

  async updateNoveltyById(novelty: NoveltyUpdateRequest): Promise<string> {
    try {
      const { _id, ...fieldsToUpdate } = novelty;
      const updatedNovelty = await this.noveltyModel.findByIdAndUpdate(
        _id,
        {
          $set: fieldsToUpdate,
        },
        { new: true },
      );

      if (!updatedNovelty) {
        throw new Error('Novelty not found');
      }

      return updatedNovelty.id;
    } catch (error: any) {
      throw error;
    }
  }

  async deleteNoveltyById(id: string): Promise<void> {
    try {
      await this.noveltyModel.findByIdAndDelete(id);
    } catch (error: any) {
      throw error;
    }
  }
}
