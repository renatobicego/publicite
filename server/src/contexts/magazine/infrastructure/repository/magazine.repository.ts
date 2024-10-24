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
import { MagazineUpdateRequest } from '../../application/adapter/dto/HTTP-REQUEST/magazine.update.request';
import { checkResultModificationOfOperation } from 'src/contexts/shared/functions/checkResultModificationOfOperation';
import { MagazineSectionCreateRequest } from '../../application/adapter/dto/HTTP-REQUEST/magazineSection.create.request';

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
  async addNewMagazineSection(
    magazineAdmin: string,
    magazineId: string,
    section: MagazineSectionCreateRequest,
    groupId?: string,
  ): Promise<any> {
    const session = await this.connection.startSession();
    session.startTransaction();
    try {
      if (groupId) {
        const resultOfOperation = await this.groupMagazine
          .updateOne(
            { _id: magazineId, allowedCollaborators: magazineAdmin },
            { $addToSet: { sections: section } },
            { session },
          )
          .lean();

        if (resultOfOperation.modifiedCount === 0) {
          this.logger.log(
            'No sections were created, because the magazine was not found or the user was not allowed to create it',
          );
          this.logger.log('Verification if user is an allowed admin group');

          const isAdminOrCreator = await this.groupModel
            .findOne(
              {
                _id: groupId,
                $or: [{ admins: magazineAdmin }, { creator: magazineAdmin }],
              },
              { session },
            )
            .lean();

          if (isAdminOrCreator) {
            this.logger.log('User is an allowed admin group');
            await this.groupMagazine
              .updateOne(
                { _id: groupId },
                { $addToSet: { sections: section } },
                { session },
              )
              .lean();
          } else {
            throw new Error('User is not an allowed admin group');
          }
        }
      } else {
        await this.userMagazine.updateOne(
          {
            _id: magazineId,
            $or: [{ collaborators: magazineAdmin }, { user: magazineAdmin }],
          },
          { $addToSet: { sections: section } },
          { session },
        );
      }

      await session.commitTransaction();
    } catch (error: any) {
      if (session.inTransaction()) {
        await session.abortTransaction();
      }
      throw error;
    } finally {
      session.endSession();
    }
  }

  async addPostInGroupMagazine(
    postId: string,
    magazineId: string,
    magazineAdmin: string,
    sectionId: string,
  ): Promise<any> {
    const session = await this.connection.startSession();
    session.startTransaction();
    try {
      const isAllowedUser = await this.groupMagazine.findOne(
        {
          _id: magazineId,
          allowedCollaborators: magazineAdmin,
        },
        { session },
      );

      if (!isAllowedUser) {
        const isAdminOrCreatorGroup = await this.groupModel.findOne(
          {
            magazines: magazineId,
            $or: [{ admins: magazineAdmin }, { creator: magazineAdmin }],
          },
          { session },
        );

        if (!isAdminOrCreatorGroup) {
          throw new Error(
            'The user is not allowed to add a post in this magazine',
          );
        }
      }

      await this.magazineSection
        .updateOne(
          { _id: sectionId },
          { $addToSet: { posts: postId } },
          { session },
        )
        .lean();

      await session.commitTransaction();
    } catch (error: any) {
      if (session.inTransaction()) {
        await session.abortTransaction();
      }
      throw error;
    } finally {
      session.endSession();
    }
  }

  async addPostInUserMagazine(
    postId: string,
    magazineId: string,
    magazineAdmin: string,
    sectionId: string,
  ): Promise<any> {
    const session = await this.connection.startSession();
    session.startTransaction();
    try {
      const isUserAllowed = await this.userMagazine.findOne(
        {
          _id: magazineId,
          $or: [{ user: magazineAdmin }, { collaborators: magazineAdmin }],
        },
        { session },
      );

      if (isUserAllowed) {
        await this.magazineSection
          .updateOne(
            { _id: sectionId },
            { $addToSet: { posts: postId } },
            { session },
          )
          .lean();

        await session.commitTransaction();
      } else {
        throw new Error(
          'The user is not allowed to add a post in this magazine',
        );
      }
    } catch (error: any) {
      if (session.inTransaction()) {
        await session.abortTransaction();
      }
      throw error;
    } finally {
      session.endSession();
    }
  }

  async addCollaboratorsToUserMagazine(
    newColaborators: string[],
    magazineId: string,
    magazineAdmin: string,
  ): Promise<void> {
    const session = await this.connection.startSession();
    try {
      await session.withTransaction(async () => {
        const result = await this.userMagazine.updateOne(
          { _id: magazineId, user: magazineAdmin },
          { $addToSet: { collaborators: { $each: newColaborators } } },
          { session },
        );

        checkResultModificationOfOperation(result);

        await this.userModel.updateMany(
          { _id: { $in: newColaborators } },
          { $addToSet: { magazines: magazineId } },
          { session },
        );
        await session.commitTransaction();
        this.logger.log('Colaborators added to Magazine successfully');
      });
    } catch (error: any) {
      this.logger.error('Error adding Colaborators to Magazine', error);
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }
  async addAllowedCollaboratorsToGroupMagazine(
    newAllowedCollaborators: string[],
    magazineId: string,
    magazineAdmin: string,
  ): Promise<any> {
    const session = await this.connection.startSession();
    try {
      await session.withTransaction(async () => {
        //Verifico si es un admin en el grupo
        const group = await this.groupModel
          .findOne({
            magazines: magazineId,
            $or: [{ admins: magazineAdmin }, { creator: magazineAdmin }],
          })
          .session(session)
          .lean();

        if (!group) {
          throw new Error('Not allowed');
        } else if (group) {
          this.logger.log('User is an allowed admin group');
          await this.groupMagazine
            .updateOne(
              { _id: magazineId },
              {
                $addToSet: {
                  allowedCollaborators: { $each: newAllowedCollaborators },
                },
              },
              { session },
            )
            .lean();
          await this.userModel
            .updateMany(
              { _id: { $in: newAllowedCollaborators } },
              { $addToSet: { magazines: magazineId } },
              { session },
            )
            .lean();
        } else {
          throw new Error('Not allowed');
        }
      });
      await session.commitTransaction();
      this.logger.log('Allowed Colaborators added to Magazine successfully');
      return;
    } catch (error: any) {
      this.logger.error('Error adding Allowed Colaborators to Magazine', error);
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  async deleteCollaboratorsFromMagazine(
    colaboratorsToDelete: string[],
    magazineId: string,
    magazineAdmin: string,
  ): Promise<void> {
    const session = await this.connection.startSession();
    try {
      await session.withTransaction(async () => {
        const result = await this.userMagazine
          .updateOne(
            { _id: magazineId, user: magazineAdmin },
            { $pullAll: { collaborators: colaboratorsToDelete } },
            { session },
          )
          .lean();

        checkResultModificationOfOperation(result);

        await this.userModel
          .updateMany(
            { _id: { $in: colaboratorsToDelete } },
            { $pull: { magazines: magazineId } },
            { session },
          )
          .lean();
        await session.commitTransaction();
        this.logger.log('Colaborators deleted from Magazine successfully');
      });
    } catch (error: any) {
      if (session.inTransaction()) {
        await session.abortTransaction();
      }
      this.logger.error('Error deleting Colaborators from Magazine', error);
      throw error;
    } finally {
      session.endSession();
    }
  }

  async deleteAllowedCollaboratorsFromMagazineGroup(
    allowedCollaboratorsToDelete: string[],
    magazineId: string,
    magazineAdmin: string,
  ): Promise<any> {
    const session = await this.connection.startSession();
    try {
      await session.withTransaction(async () => {
        const group = await this.groupModel
          .findOne({
            magazines: magazineId,
            $or: [{ admins: magazineAdmin }, { creator: magazineAdmin }],
          })
          .session(session)
          .lean();
        if (!group) {
          throw new Error('Not allowed or group not found');
        }

        await this.userModel
          .updateMany(
            { _id: { $in: allowedCollaboratorsToDelete } },
            { $pull: { magazines: magazineId } },
            { session },
          )
          .lean();
        await this.groupMagazine
          .updateOne(
            { _id: magazineId },
            {
              $pullAll: { allowedCollaborators: allowedCollaboratorsToDelete },
            },
            { session },
          )
          .lean();
      });
      await session.commitTransaction();
      this.logger.log(
        'Allowed Colaborators deleted from Magazine Group successfully',
      );
      return;
    } catch (error: any) {
      await session.abortTransaction();
      this.logger.error(
        'Error deleting Allowed Colaborators from Magazine Group',
        error,
      );
      throw error;
    } finally {
      session.endSession();
    }
  }

  async deleteSectionFromGroupMagazineById(
    sectionIdsToDelete: string[],
    magazineId: string,
    allowedCollaboratorId: string,
  ): Promise<void> {
    const session = await this.connection.startSession();
    try {
      await session.withTransaction(async () => {
        // Eliminar las secciones de las revistas
        const resultOfOperation = await this.groupMagazine.updateOne(
          {
            _id: magazineId,
            allowedCollaborators: allowedCollaboratorId,
          },
          { $pull: { sections: { $in: sectionIdsToDelete } } },
          { session },
        );

        // Si no se modificó nada, verificar si el usuario es admin o creador
        if (resultOfOperation.modifiedCount === 0) {
          this.logger.log(
            'No sections were deleted, because the section was not found or the user was not allowed to delete it',
          );
          this.logger.log('Verification if user is an allowed admin group');

          const group = await this.groupModel
            .findOne({
              magazines: magazineId,
              $or: [
                { admins: allowedCollaboratorId },
                { creator: allowedCollaboratorId },
              ],
            })
            .session(session)
            .lean();

          if (group) {
            this.logger.log(
              'The user is admin or creator, deleting sections in magazine',
            );
            await this.groupMagazine
              .updateMany(
                { _id: magazineId },
                { $pull: { sections: { $in: sectionIdsToDelete } } },
                { session },
              )
              .lean();
            this.logger.log('Deleting sections...');
            await this.magazineSection
              .deleteMany({ _id: { $in: sectionIdsToDelete } }, { session })
              .lean();
          } else {
            throw new Error('The user is not allowed to delete this section');
          }
        } else if (resultOfOperation.modifiedCount > 0) {
          this.logger.log('Sections deleted in group magazine successfully');
          await this.magazineSection
            .deleteMany({ _id: { $in: sectionIdsToDelete } }, { session })
            .lean();
          this.logger.log('Magazine sections were deleted successfully');
        }
      });
    } catch (error: any) {
      throw error;
    } finally {
      await session.endSession();
    }
  }

  async deleteSectionFromUserMagazineById(
    sectionIdsToDelete: string[],
    magazineId: string,
    userMagazineAllowed: string,
  ): Promise<void> {
    const session = await this.connection.startSession();
    session.startTransaction();
    try {
      await session.withTransaction(async () => {
        const resultOfOperation = await this.userMagazine.updateOne(
          {
            _id: magazineId,
            $or: [
              { user: userMagazineAllowed },
              { collaborators: userMagazineAllowed },
            ],
          },
          { $pull: { sections: sectionIdsToDelete } },
          { session },
        );
        checkResultModificationOfOperation(resultOfOperation);
        await this.magazineSection.deleteMany(
          {
            _id: { $in: sectionIdsToDelete },
          },
          { session },
        );
      });

      await session.commitTransaction();
    } catch (error: any) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  async findMagazineByMagazineId(
    id: ObjectId,
  ): Promise<Partial<MagazineResponse> | null> {
    const session = await this.connection.startSession();
    session.startTransaction();
    try {
      const magazine = await this.magazineModel
        .findById(id)
        .select(
          '_id collaborators name user description sections ownerType allowedCollaborators group visibility',
        )
        .populate([
          { path: 'collaborators', select: '_id username profilePhotoUrl' },
          {
            path: 'user',
            select: '_id username profilePhotoUrl',
          },
          {
            path: 'group',
            select: '_id name profilePhotoUrl',
          },
          {
            path: 'sections',
            select: '_id isFatherSection posts title',
            populate: {
              path: 'posts',
              select:
                '_id imagesUrls title description price frequencyPrice petitionType postType',
            },
          },
          {
            path: 'allowedCollaborators',
            select: '_id username profilePhotoUrl',
          },
        ])
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
                  { $addToSet: { magazines: magazineSaved._id } },
                  { session },
                );
              }
              return magazineSaved._id;
            }
            case OwnerType.group: {
              const groupMagazine = new this.groupMagazine(magazine);
              magazineSaved = await groupMagazine.save({ session });
              const result = await this.groupModel.updateOne(
                { _id: groupMagazine.group },
                { $addToSet: { magazines: magazineSaved._id } },
                { session },
              );
              if (result.matchedCount === 0) {
                throw new Error('Group not found');
              }
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

  async updateMagazineById(
    magazine: MagazineUpdateRequest,
    owner: string,
    groupId?: string,
  ): Promise<any> {
    try {
      switch (magazine.ownerType) {
        case OwnerType.user: {
          const response = await this.userMagazine
            .findOneAndUpdate({ _id: magazine._id, user: owner }, magazine)
            .lean();
          return response?._id;
        }
        case OwnerType.group: {
          const group = await this.groupModel
            .findOne({
              _id: groupId,
              $or: [{ admins: owner }, { creator: owner }],
            })
            .lean();
          if (!group) {
            throw new Error('Not allowed or group not found');
          }

          const response = await this.groupMagazine
            .findByIdAndUpdate(magazine._id, magazine)
            .lean();
          return response?._id;
        }
        default: {
          throw new Error('Invalid owner type');
        }
      }
    } catch (error: any) {
      throw error;
    }
  }
}
