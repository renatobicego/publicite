import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Magazine } from '../../domain/entity/magazine.entity';
import { Connection, Model, ObjectId } from 'mongoose';

import { MagazineRepositoryInterface } from '../../domain/repository/magazine.repository.interface';
import { MyLoggerService } from 'src/contexts/shared/logger/logger.service';
import {
  MagazineSectionDocument,
  MagazineSectionModel,
} from '../schemas/section/magazine.section.schema';
import { OwnerType } from '../../domain/entity/enum/magazine.ownerType.enum';
import {
  UserMagazineDocument,
  UserMagazineModel,
} from '../schemas/magazine.user.schema';
import {
  GroupMagazineDocument,
  GroupMagazineModel,
} from '../schemas/magazine.group.schema';
import { MagazineResponse } from '../../application/adapter/dto/HTTP-RESPONSE/magazine.reponse';
import { MagazineDocument, MagazineModel } from '../schemas/magazine.schema';
import { Inject } from '@nestjs/common';
import { MagazineRepositoryMapper } from './mapper/magazine.repository.mapper';
import { MagazineRepositoryMapperInterface } from '../../domain/repository/mapper/magazine.respository.mapper.interface';

export class MagazineRepository implements MagazineRepositoryInterface {
  constructor(
    @InjectConnection() private readonly connection: Connection,
    private readonly logger: MyLoggerService,

    @Inject('MagazineRepositoryMapperInterface')
    private readonly magazineRepositoryMapper: MagazineRepositoryMapperInterface,

    @InjectModel(MagazineModel.modelName)
    private readonly magazineModel: Model<MagazineDocument>,
    @InjectModel(MagazineSectionModel.modelName)
    private readonly magazineSection: Model<MagazineSectionDocument>,
    @InjectModel(UserMagazineModel.modelName)
    private readonly userMagazine: Model<UserMagazineDocument>,
    @InjectModel(GroupMagazineModel.modelName)
    private readonly groupMagazine: Model<GroupMagazineDocument>,
  ) {}
  async findMagazineByMagazineId(
    id: ObjectId,
  ): Promise<Partial<MagazineResponse>[] | []> {
    try {
      let magazines = [];
      magazines = await this.magazineModel.find({ _id: id });
      if (magazines.length > 0) {
        const magz = magazines.map((magazine) => {
          return this.magazineRepositoryMapper.toReponse(magazine);
        });
        return magz;
      }

      return magazines as any;
    } catch (error: any) {
      throw error;
    }
  }
  async save(magazine: Magazine): Promise<any> {
    if (magazine.getSections.length <= 0) {
      try {
        switch (magazine.getOwnerType) {
          case OwnerType.user: {
            const userMagazine = new this.userMagazine(magazine);
            console.log(userMagazine);
            return await userMagazine.save();
          }
          case OwnerType.group: {
            const groupMagazine = new this.groupMagazine(magazine);
            return await groupMagazine.save();
          }
          default: {
            throw new Error('Invalid owner type');
          }
        }
      } catch (error: any) {
        throw error;
      }
    }
    return this.saveMagazineWithSection(magazine);
  }

  async saveMagazineWithSection(magazine: Magazine): Promise<any> {
    const session = await this.connection.startSession();
    try {
      await session.withTransaction(async () => {
        const section = magazine.getSections.pop();

        const newMagazineSection = new this.magazineSection(section);
        const sectionSave = await newMagazineSection.save({ session });
        const magazineToSave = {
          ...magazine,
          sections: sectionSave._id,
        };

        switch (magazine.getOwnerType) {
          case OwnerType.user: {
            const userMagazine = new this.userMagazine(magazineToSave);
            await userMagazine.save({ session });
            break;
          }
          case OwnerType.group: {
            const groupMagazine = new this.groupMagazine(magazineToSave);
            await groupMagazine.save({ session });
            break;
          }
          default: {
            throw new Error('Invalid owner type');
          }
        }
        session.commitTransaction();
      });
    } catch (error: any) {
      this.logger.error('Error creating Magazine with section: ' + error);
      await session.abortTransaction();
      this.logger.error('Session aborted');
    } finally {
      session.endSession();
    }
  }
}
