import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Magazine } from '../../domain/entity/magazine.entity';
import { Connection, Model, ObjectId } from 'mongoose';
import { Inject } from '@nestjs/common';

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
import { MagazineRepositoryMapperInterface } from '../../domain/repository/mapper/magazine.respository.mapper.interface';
import { IUser } from 'src/contexts/user/infrastructure/schemas/user.schema';
import { GroupDocument } from 'src/contexts/group/infrastructure/schemas/group.schema';

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
    @InjectModel('User') private readonly userModel: Model<IUser>,
    @InjectModel('Group') private readonly groupModel: Model<GroupDocument>,
  ) {}
  async findMagazineByMagazineId(
    id: ObjectId,
  ): Promise<Partial<MagazineResponse> | null> {
    const session = await this.connection.startSession();
    session.startTransaction();
    try {
      const magazine = await this.magazineModel
        .findById({ _id: id })
        .select(
          '_id collaborators name user description sections ownerType allowedColaborators group',
        )
        .populate({
          path: 'collaborators',
          select: '_id username profilePhotoUrl',
        })
        .populate({
          path: 'user',
          select: '_id username profilePhotoUrl',
        })
        .populate({
          path: 'group',
          select: '_id name profilePhotoUrl',
        })
        .populate({
          path: 'sections',
          select: '_id isFatherSection posts title',
        })
        .populate({
          path: 'allowedColaborators',
          select: '_id username profilePhotoUrl',
        })
        .session(session);

      if (!magazine) {
        await session.abortTransaction();
        session.endSession();
        return null;
      }

      await session.commitTransaction();
      session.endSession();
      return this.magazineRepositoryMapper.toReponse(magazine);
    } catch (error: any) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  }

  async save(magazine: Magazine): Promise<any> {
    let magazineSaved;
    if (magazine.getSections.length <= 0) {
      const session = await this.connection.startSession();
      try {
        await session.withTransaction(async () => {
          switch (magazine.getOwnerType) {
            case OwnerType.user: {
              const userMagazine = new this.userMagazine(magazine);
              magazineSaved = await userMagazine.save({ session });
              await this.userModel.findByIdAndUpdate(
                //Updateo el dueño de la revista
                userMagazine.user,
                { $push: { magazines: magazineSaved._id } },
                { session },
              );
              if (userMagazine.collaborators.length > 0) {
                await this.userModel.updateMany(
                  //Updateo los colaboradores
                  { _id: { $in: userMagazine.collaborators } },
                  { $push: { magazines: magazineSaved._id } },
                  { session },
                );
              }
              return magazineSaved._id;
            }
            case OwnerType.group: {
              const groupMagazine = new this.groupMagazine(magazine);
              magazineSaved = await groupMagazine.save({ session });
              await this.groupModel.findByIdAndUpdate(
                //Updateo la revista en el grupo
                groupMagazine.group,
                { $push: { magazines: magazineSaved._id } },
                { session },
              );
              return magazineSaved._id;
            }
            default: {
              throw new Error('Invalid owner type');
            }
          }
        });
        return magazineSaved!._id;
      } catch (error: any) {
        throw error;
      }
    }
    return this.saveMagazineWithSection(magazine);
  }

  async saveMagazineWithSection(magazine: Magazine): Promise<any> {
    const session = await this.connection.startSession();
    let magazineSaved;
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
            magazineSaved = await userMagazine.save({ session });
            await this.userModel.findByIdAndUpdate(
              //Updateo el dueño de la revista
              userMagazine.user,
              { $push: { magazines: magazineSaved._id } },
              { session },
            );
            if (userMagazine.collaborators.length > 0) {
              await this.userModel.updateMany(
                //Updateo los colaboradores
                { _id: { $in: userMagazine.collaborators } },
                { $push: { magazines: magazineSaved._id } },
                { session },
              );
            }
            session.commitTransaction();
            return magazineSaved._id;
          }
          case OwnerType.group: {
            const groupMagazine = new this.groupMagazine(magazineToSave);
            magazineSaved = await groupMagazine.save({ session });
            await this.groupModel.findByIdAndUpdate(
              //Updateo la revista en el grupo
              groupMagazine.group,
              { $push: { magazines: magazineSaved._id } },
              { session },
            );

            session.commitTransaction();
            return magazineSaved._id;
          }
          default: {
            throw new Error('Invalid owner type');
          }
        }
      });
      return magazineSaved!._id;
    } catch (error: any) {
      this.logger.error('Error creating Magazine with section: ' + error);
      await session.abortTransaction();
      this.logger.error('Session aborted');
    } finally {
      session.endSession();
    }
  }
}
