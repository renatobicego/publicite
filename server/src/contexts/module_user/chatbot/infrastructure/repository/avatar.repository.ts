import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';

import { AvatarRepositoryInterface } from '../../domain/repository/avatar.repository.interface';
import { Avatar } from '../../domain/entity/avatar.entity';
import { AvatarDocument } from '../schemas/avatar.schema';
import { MyLoggerService } from 'src/contexts/module_shared/logger/logger.service';

@Injectable()
export class AvatarRepository implements AvatarRepositoryInterface {
  constructor(
    @InjectModel('Avatar')
    private readonly avatarModel: Model<AvatarDocument>,
    private readonly logger: MyLoggerService,
  ) {}

  async create(avatar: Avatar): Promise<Avatar> {
    try {
      // El seed es el _id del avatar, así que hay que generarlo antes de guardar.
      const _id = new mongoose.Types.ObjectId();
      const doc = new this.avatarModel({
        _id,
        userId: avatar.getUserId,
        name: avatar.getName,
        context: avatar.getContext,
        seed: avatar.getSeed || _id.toString(),
      });

      const saved = await doc.save();
      return this.documentToEntity(saved);
    } catch (error: any) {
      this.logger.error('Error creating avatar: ' + error.message);
      throw error;
    }
  }

  async findByUserId(userId: string): Promise<Avatar[]> {
    try {
      const docs = await this.avatarModel
        .find({ userId })
        .sort({ createdAt: 1 })
        .exec();
      return docs.map((doc) => this.documentToEntity(doc));
    } catch (error: any) {
      this.logger.error('Error finding avatars: ' + error.message);
      throw error;
    }
  }

  async findById(avatarId: string): Promise<Avatar | null> {
    try {
      if (!mongoose.Types.ObjectId.isValid(avatarId)) return null;
      const doc = await this.avatarModel.findById(avatarId).exec();
      return doc ? this.documentToEntity(doc) : null;
    } catch (error: any) {
      this.logger.error('Error finding avatar: ' + error.message);
      throw error;
    }
  }

  async countByUserId(userId: string): Promise<number> {
    try {
      return await this.avatarModel.countDocuments({ userId });
    } catch (error: any) {
      this.logger.error('Error counting avatars: ' + error.message);
      throw error;
    }
  }

  async update(
    avatarId: string,
    changes: { name?: string; context?: string },
  ): Promise<Avatar | null> {
    try {
      if (!mongoose.Types.ObjectId.isValid(avatarId)) return null;
      const doc = await this.avatarModel
        .findByIdAndUpdate(avatarId, changes, { new: true })
        .exec();
      return doc ? this.documentToEntity(doc) : null;
    } catch (error: any) {
      this.logger.error('Error updating avatar: ' + error.message);
      throw error;
    }
  }

  async delete(avatarId: string): Promise<boolean> {
    try {
      if (!mongoose.Types.ObjectId.isValid(avatarId)) return false;
      const result = await this.avatarModel.findByIdAndDelete(avatarId).exec();
      return !!result;
    } catch (error: any) {
      this.logger.error('Error deleting avatar: ' + error.message);
      throw error;
    }
  }

  private documentToEntity(doc: AvatarDocument): Avatar {
    return new Avatar(
      doc.userId,
      doc.name,
      doc.context,
      doc.seed,
      doc._id as any,
      doc.createdAt,
      doc.updatedAt,
    );
  }
}
