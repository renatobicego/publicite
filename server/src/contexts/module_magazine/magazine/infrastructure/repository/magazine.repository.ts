import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Magazine } from '../../domain/entity/magazine.entity';
import { Connection, Model, ObjectId } from 'mongoose';
import { Inject, UnauthorizedException } from '@nestjs/common';

import { MagazineRepositoryInterface } from '../../domain/repository/magazine.repository.interface';
import { MyLoggerService } from 'src/contexts/module_shared/logger/logger.service';
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

import { MagazineSectionCreateRequest } from '../../application/adapter/dto/HTTP-REQUEST/magazineSection.create.request';
import { GroupDocument } from 'src/contexts/module_group/group/infrastructure/schemas/group.schema';
import { checkIfanyDataWasModified, chekResultOfOperation } from 'src/contexts/module_shared/utils/functions/check.result.functions';
import { IUser } from 'src/contexts/module_user/user/infrastructure/schemas/user.schema';
import { MagazineUpdateRequest } from '../../application/adapter/dto/HTTP-REQUEST/magazine.update.request';
import { UserMagazineAllowedVerificationsInterface } from '../../domain/repository/user.allowed.verifications.interface';
/*


DOCUMENTACION IMPORTANTE DE LA CLASE 

Al utilizar findOneAndDelete y deleteMany, se debe tener en cuenta que se eliminan las secciones asociadas a la revista. Automaticamente


*/

export class MagazineRepository implements MagazineRepositoryInterface, UserMagazineAllowedVerificationsInterface {
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
  ) { }



  async addNewMagazineGroupSection(
    magazineId: string,
    section: MagazineSectionCreateRequest,
  ): Promise<any> {
    const session = await this.connection.startSession();
    try {
      await session.withTransaction(async () => {
        const sectionId = await this.saveSection(section, session);
        if (sectionId === null || !sectionId) {
          throw new Error('Error saving section in repository');
        }
        await this.groupMagazine
          .updateOne(
            { _id: magazineId },
            { $addToSet: { sections: sectionId } },
            { session },
          )

      });
    } catch (error: any) {
      throw error;
    } finally {
      await session.endSession();
    }
  }
  async addNewMagazineUserSection(
    magazineId: string,
    section: MagazineSectionCreateRequest,
    magazineAdmin: string,
  ): Promise<any> {
    const session = await this.connection.startSession();

    try {
      await session.withTransaction(async () => {
        const sectionId = await this.saveSection(section, session);
        if (sectionId === null || !sectionId) {
          throw new Error('Error saving section in repository');
        }

        const result = await this.userMagazine.updateOne(
          {
            _id: magazineId,
            $or: [{ collaborators: magazineAdmin }, { user: magazineAdmin }],
          },
          { $addToSet: { sections: sectionId } },
          { session },
        );


        chekResultOfOperation(
          result,
          'Error saving section in repository, you dont have permissions',
        );
      });
    } catch (error: any) {
      throw error;
    } finally {
      await session.endSession();
    }
  }



  async addPostInGroupMagazine(
    postId: string,
    sectionId: string,
  ): Promise<any> {
    try {
      await this.magazineSection
        .updateOne(
          { _id: sectionId },
          { $addToSet: { posts: postId } },
        )
    } catch (error: any) {
      throw error;
    }
  }

  async addPostInUserMagazine(
    postId: string,
    magazineId: string,
    magazineAdmin: string,
    sectionId: string,
  ): Promise<any> {


    try {
      const result = await this.userMagazine
        .findOne({
          _id: magazineId,
          $or: [{ user: magazineAdmin }, { collaborators: magazineAdmin }],
        })
        .lean();
      chekResultOfOperation(
        result,
        'You must be an admin or a collaborator to add a post to a magazine',
      );

      await this.magazineSection.updateOne(
        { _id: sectionId },
        { $addToSet: { posts: postId } },
      );

    } catch (error: any) {
      throw error;
    }
  }

  async addCollaboratorsToUserMagazine(
    newCollaborators: string[],
    magazineId: string,
    magazineAdmin: string,
    session?: any
  ): Promise<void> {
    try {
      const result = await this.userMagazine.updateOne(
        { _id: magazineId, user: magazineAdmin },
        { $addToSet: { collaborators: { $each: newCollaborators } } },
        { session },
      );


      chekResultOfOperation(result);

      await this.userModel.updateMany(
        { _id: { $in: newCollaborators } },
        { $addToSet: { magazines: magazineId } },
        { session },
      );

      this.logger.log('Collaborators added to Magazine successfully');
    } catch (error: any) {
      this.logger.error('Error adding Collaborators to Magazine', error);
      if (session) {
        await session.abortTransaction();
      }
      throw error;
    }
  }

  async addAllowedCollaboratorsToGroupMagazine(
    newAllowedCollaborators: string[],
    magazineId: string,
    magazineAdmin: string,
    session?: any
  ): Promise<any> {
    try {
      const result = await this.groupModel
        .findOne({
          magazines: magazineId,
          creator: magazineAdmin,
        })
        .session(session)
        .lean();
      chekResultOfOperation(result);

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

      // await this.userModel
      //   .updateMany(
      //     { _id: { $in: newAllowedCollaborators } },
      //     { $addToSet: { magazines: magazineId } },
      //     { session },
      //   )
      //   .lean();


      this.logger.log('Allowed Collaborators added to Magazine successfully');
      return;
    } catch (error: any) {
      this.logger.error(
        'Error adding Allowed Collaborators to Magazine',
        error,
      );
      throw error;
    }
  }

  async deleteCollaboratorsFromMagazine(
    collaboratorsToDelete: string[],
    magazineId: string,
    magazineAdmin: string,
    session?: any
  ): Promise<void> {

    try {

      const result = await this.userMagazine
        .updateOne(
          { _id: magazineId, user: magazineAdmin },
          { $pullAll: { collaborators: collaboratorsToDelete } },
          { session },
        )
      checkIfanyDataWasModified(result);



      await this.userModel
        .updateMany(
          { _id: { $in: collaboratorsToDelete } },
          { $pull: { magazines: magazineId } },
          { session },
        )

      this.logger.log('Collaborators deleted from Magazine successfully');

    } catch (error: any) {
      this.logger.error('Error deleting Collaborators from Magazine', error);
      if(session){
        await session.abortTransaction();
      }
      throw error;
    }
  }

  async deleteAllowedCollaboratorsFromMagazineGroup(
    allowedCollaboratorsToDelete: string[],
    magazineId: string,
    magazineAdmin: string,
    session?: any
  ): Promise<any> {

    try {

      const isAuthorized = await this.groupModel
        .findOne({
          magazines: magazineId,
          creator: magazineAdmin,
        })
        .session(session)
        .lean();
      if (!isAuthorized) {
        throw new UnauthorizedException();
      }


      const result1 = await this.userModel
        .updateMany(
          { _id: { $in: allowedCollaboratorsToDelete } },
          { $pull: { magazines: magazineId } },
          { session },
        )
        .lean();
      checkIfanyDataWasModified(result1);
      const result2 = await this.groupMagazine
        .updateOne(
          { _id: magazineId },
          {
            $pullAll: { allowedCollaborators: allowedCollaboratorsToDelete },
          },
          { session },
        )
        .lean();
      checkIfanyDataWasModified(result2)
      this.logger.log(
        'Allowed Collaborators deleted from Magazine Group successfully',
      );
      return;
    } catch (error: any) {
      this.logger.error('Error deleting Collaborators from Magazine', error);
      throw error;

    }
  }

  async deleteSectionFromGroupMagazineById(
    sectionIdsToDelete: string[],
    magazineId: string,
  ): Promise<void> {
    const session = await this.connection.startSession();
    try {
      await session.withTransaction(async () => {
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
      });
      this.logger.log('Sections successfully deleted...');
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
          { $pullAll: { sections: [sectionIdsToDelete] } },
          { session },
        );
        chekResultOfOperation(resultOfOperation);
        await this.magazineSection.deleteMany(
          {
            _id: { $in: sectionIdsToDelete },
          },
          { session },
        );
      });
    } catch (error: any) {
      throw error;
    } finally {
      await session.endSession();
    }
  }

  async deletePostInMagazineSection(
    postIdToRemove: string,
    sectionId: string,
  ): Promise<any> {
    try {
      await this.magazineSection.updateOne(
        { _id: sectionId },
        { $pullAll: { posts: [postIdToRemove] } },
      );
    } catch (error: any) {
      throw error;
    }
  }
  async deleteMagazineByMagazineId(magazineId: string): Promise<any> {
    const session = await this.connection.startSession();

    try {
      await session.withTransaction(async () => {
        const magazineDeleted = await this.magazineModel.findOneAndDelete({
          _id: magazineId
        }).session(session).lean();

        if (magazineDeleted) {
          this.logger.log('Deleting Magazine... ');
          await this.magazineSection.deleteMany({ _id: { $in: magazineDeleted.sections } }, { session });



          if (magazineDeleted.ownerType === OwnerType.user) {
            let userMagazine = magazineDeleted as unknown as UserMagazineDocument
            let collaboratorsAndCreatorIds = userMagazine.collaborators
            collaboratorsAndCreatorIds.push(userMagazine.user)

            if (collaboratorsAndCreatorIds && collaboratorsAndCreatorIds.length > 0) {
              this.logger.log('Removing collaborators and creator from magazines... ');
              await this.userModel.updateMany({ _id: { $in: collaboratorsAndCreatorIds } }, { $pull: { magazines: magazineId } }, { session });
              this.logger.log('Removing collaborators successfully');
            }

            this.logger.log('Magazine deleted successfully');
            return 'Magazine deleted successfully';
          } else if (magazineDeleted.ownerType === OwnerType.group) {

            let userMagazine = magazineDeleted as unknown as GroupMagazineDocument
            const groupOfMagazine = userMagazine.group;
            await this.groupModel.updateOne({ _id: groupOfMagazine }, { $pull: { magazines: magazineId } }, { session });
            this.logger.log('Magazine deleted successfully');

            return 'Magazine deleted successfully';
          } else {
            this.logger.error('Error deleting magazine, please try again: INVALID OWNER TYPE');
            throw new Error('Error deleting magazine, please try again: INVALID OWNER TYPE');
          }
        }

      })
    } catch (error) {
      this.logger.error('Error deleting magazine', error);
      throw error;
    }

  }


  async deletePostInMagazine(_id: string): Promise<any> {
    try {
      await this.magazineSection.updateMany(
        { posts: _id },
        { $pull: { posts: _id } },
      )
    } catch (error: any) {
      throw error;
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
          '_id collaborators name user description sections ownerType allowedCollaborators group visibility -kind',
        )
        .populate([
          {
            path: 'collaborators',
            select: '_id username profilePhotoUrl',
            model: 'User',
          },
          {
            path: 'user',
            select: '_id username profilePhotoUrl',
            model: 'User',
          },
          {
            path: 'group',
            select: '_id name profilePhotoUrl admins creator',
            model: 'Group',
          },
          {
            path: 'sections',
            select: '_id isFatherSection posts title',
            model: 'MagazineSection',
            populate: {
              path: 'posts',
              match: { isActive: true },
              select:
                '_id imagesUrls title description price frequencyPrice petitionType postType',
              model: 'Post',
            },
          },
          {
            path: 'allowedCollaborators',
            select: '_id username profilePhotoUrl',
            model: 'User',
          },
        ])
        .session(session)
        .lean();
      if (!magazine) {
        await session.abortTransaction();
        return null;
      }
      await session.commitTransaction();
      return this.magazineRepositoryMapper.toReponse(magazine);
    } catch (error: any) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  async findAllMagazinesByUserId(
    userId: string,
  ): Promise<MagazineResponse[] | []> {
    /*
    revistas que puede tener el usuario  
    1. Revistas en su propio array (contiene revistas propias y revistas de usuarios en las que es colaborador)
    2. Revistas de grupo. estas no se encuentran en su personal array, pero las buscamos en la revista de grupo.
    */
    const session = await this.connection.startSession();
    const userMagazines: any = [];
    const fieldSelect = '_id name sections ownerType visibility';
    const populateField = [
      {
        path: 'sections',
        select: '_id title posts isFatherSection',
        model: 'MagazineSection',
      },
    ];
    const personalMagazines = await this.userMagazine
      .find(
        {
          $or: [{ user: userId }, { collaborators: userId }],
        },
        null,
        { session },
      )
      .select(fieldSelect)
      .populate(populateField)
      .lean();

    const groups = await this.groupModel
      .find({
        $or: [{ admins: userId }, { creator: userId }],
      })
      .select('magazines -_id')
      .populate({
        path: 'magazines',
        select: '_id name sections ownerType',
        model: 'GroupMagazine',
        populate: {
          path: 'sections',
          select: '_id title posts isFatherSection',
          model: 'MagazineSection',
        },
      })
      .session(session)
      .lean();

    const uniqueMagazineIds = new Set<string>(); // Track unique magazine IDs

    if (groups) {
      groups.forEach((group: any) => {
        group.magazines.forEach((magazine: any) => {
          if (!uniqueMagazineIds.has(magazine._id.toString())) {
            uniqueMagazineIds.add(magazine._id.toString());
            userMagazines.push(magazine);
          }
        });
      });
    }

    const groupMagazines = await this.groupMagazine
      .find(
        {
          allowedCollaborators: userId,
        },
        null,
        { session },
      )
      .select(fieldSelect)
      .populate(populateField)
      .lean();

    // Add allowed-collaborator magazines to the result if unique
    groupMagazines.forEach((magazine) => {
      if (!uniqueMagazineIds.has(magazine._id.toString())) {
        uniqueMagazineIds.add(magazine._id.toString());
        userMagazines.push(magazine);
      }
    });
    userMagazines.push(...personalMagazines);
    return userMagazines;
  }

  async is_admin_creator_or_collaborator_of_magazine_GROUP_MAGAZINE(
    magazineId: string,
    userId: string,
  ): Promise<any> {
    const session = await this.connection.startSession();
    session.startTransaction();

    try {
      const collaborator = await this.groupMagazine
        .findOne({ _id: magazineId, allowedCollaborators: userId })
        .session(session)
        .select('_id')
        .lean();

      const isAdminOrCreatorOfGroup = await this.groupModel
        .findOne({
          magazines: magazineId,
          $or: [{ admins: userId }, { creator: userId }],
        })
        .session(session)
        .select('_id')
        .lean();

      if (!collaborator && !isAdminOrCreatorOfGroup) {
        throw new UnauthorizedException('The user is not allowed');
      }
    } catch (error: any) {
      throw error;
    }
  }

  async is_admin_or_creator_of_magazine_GROUP_MAGAZINE(
    magazineId: string,
    userId: string,
  ): Promise<any> {
    const session = await this.connection.startSession();
    session.startTransaction();

    try {

      const isAdminOrCreatorOfGroup = await this.groupModel
        .findOne({
          magazines: magazineId,
          $or: [{ admins: userId }, { creator: userId }],
        })
        .session(session)
        .select('_id')
        .lean();

      if (!isAdminOrCreatorOfGroup) {
        throw new Error('The user is not allowed');
      }
    } catch (error: any) {
      throw error;
    }
  }
  async is_user_allowed_to_edit_section_USER_MAGAZINE(
    sectionId: string,
    userId: string,
  ): Promise<boolean> {
    try {
      const result = await this.userMagazine
        .findOne({
          sections: sectionId,
          $or: [{ user: userId }, { collaborators: userId }],
        })
        .select('_id')
        .lean();

      return !!result;
    } catch (error: any) {
      throw error;
    }
  }
  async is_user_allowed_to_edit_section_GROUP_MAGAZINE(
    sectionId: string,
    userId: string,
    magazineId: string,
  ): Promise<boolean> {
    try {
      const session = await this.connection.startSession();
      let isAllowedUser = false;
      let isAdminOrCreator = false;
      await session.withTransaction(async () => {
        const result1 = await this.groupMagazine
          .findOne(
            {
              sections: sectionId,
              allowedCollaborators: userId,
            },
            null,
            { session },
          )
          .select('_id')
          .lean();
        if (result1) isAllowedUser = true;
        const result2 = await this.groupModel
          .findOne(
            {
              magazines: magazineId,
              $or: [{ admins: userId }, { creator: userId }],
            },
            null,
            { session },
          )
          .select('_id')
          .lean();
        if (result2) isAdminOrCreator = true;
      });

      return isAllowedUser || isAdminOrCreator;
    } catch (error: any) {
      throw error;
    }
  }

  async is_creator_of_magazine_USER_MAGAZINE(magazineId: string, userId: string): Promise<boolean> {
    try {
      const result = await this.userMagazine
        .findOne({
          _id: magazineId,
          user: userId,
        })
        .select('_id')
        .lean();

      return !!result

    } catch (error: any) {
      throw error;
    }
  }



  async save(magazine: Magazine): Promise<any> {
    let magazineSaved;
    if (magazine.getSections.length <= 0) {
      const session = await this.connection.startSession();
      try {
        magazineSaved = await session.withTransaction(async () => {
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

              return magazineSaved
                .populate([
                  {
                    path: 'sections', model: 'MagazineSection', select: '_id isFatherSection posts title',

                  },

                ]);
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

              return magazineSaved
                .populate([
                  {
                    path: 'sections', model: 'MagazineSection', select: '_id isFatherSection posts title',

                  },

                ]);
            }
            default: {
              throw new Error('Invalid owner type');
            }
          }
        });



        return magazineSaved;
      } catch (error: any) {
        throw error;
      } finally {
        session.endSession();
      }

    }
    return this.saveMagazineWithSection(magazine);
  }

  async saveSection(
    section: MagazineSectionCreateRequest,
    session?: any,
  ): Promise<any> {
    try {
      const newMagazineSection = new this.magazineSection(section);

      const sectionSave = await newMagazineSection.save({ session });
      if (sectionSave) {

        return sectionSave._id;
      } else {
        return null;
      }
    } catch (error: any) {
      throw error;
    }

  }
  async saveMagazineWithSection(magazine: Magazine): Promise<any> {
    const session = await this.connection.startSession();
    let magazineSaved: any;
    try {
      magazineSaved = await session.withTransaction(async () => {
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
              userMagazine.user,
              { $push: { magazines: magazineSaved._id } },
              { session },
            );

            if (userMagazine.collaborators.length > 0) {
              await this.userModel.updateMany(
                { _id: { $in: userMagazine.collaborators } },
                { $push: { magazines: magazineSaved._id } },
                { session },
              );
            }

            return magazineSaved;
          }
          case OwnerType.group: {
            const groupMagazine = new this.groupMagazine(magazineToSave);
            magazineSaved = await groupMagazine.save({ session });

            await this.groupModel.findByIdAndUpdate(
              groupMagazine.group,
              { $push: { magazines: magazineSaved._id } },
              { session },
            );

            return magazineSaved;
          }
          default: {
            throw new Error('Invalid owner type');
          }
        }
      });


      if (magazineSaved) {
        magazineSaved = await magazineSaved.populate([
          {
            path: 'sections',
            model: 'MagazineSection',
            select: '_id isFatherSection posts title',
          }
        ]);
      }

      return magazineSaved;
    } catch (error: any) {
      this.logger.error('Error creating Magazine with section: ' + error);
      this.logger.error('Session aborted');
      return null;
    } finally {
      session.endSession();
    }
  }


  async removeCollaboratorFromUserMagazine(magazineId: string, collaboratorId: string): Promise<any> {
    const session = await this.connection.startSession();
    try {
      await session.withTransaction(async () => {
        this.logger.log('Deleting magazine from user schema ');
        await this.userModel.findByIdAndUpdate(collaboratorId, { $pull: { magazines: magazineId } }, { session });
        this.logger.log('Deleting succsesfully');
        this.logger.log('Deleting user from Magazine schema');
        await this.userMagazine.updateOne({ _id: magazineId }, { $pull: { collaborators: collaboratorId } }, { session });
        this.logger.log('User deleted from Magazine schema');
      })
    } catch (error: any) {
      this.logger.error('A problem occurred while removing user from magazine: ' + error);
      throw error;
    }
  }


  async removeAllowedCollaboratorFromGroupMagazine(magazineId: string, collaboratorId: string): Promise<any> {
    const session = await this.connection.startSession();
    try {
      await session.withTransaction(async () => {
        this.logger.log('Deleting user from Magazine group schema');
        await this.groupMagazine.updateOne({ _id: magazineId }, { $pull: { allowedCollaborators: collaboratorId } }, { session });
        this.logger.log('User deleted from Magazine schema');
        return 'Allowed collaborator removed successfully';
      })
    } catch (error: any) {
      this.logger.error('A problem occurred while removing user from magazine: ' + error);
      throw error;
    }
  }



  async updateMagazineById(
    magazine: MagazineUpdateRequest,
    owner: string,
    groupId?: string,
  ): Promise<any> {
    const session = await this.connection.startSession();
    try {
      switch (magazine.ownerType) {
        case OwnerType.user: {
          const response = await this.userMagazine
            .findOneAndUpdate({ _id: magazine._id, user: owner }, magazine)
            .session(session)
            .select('_id')
            .lean();
          return response?._id;
        }
        case OwnerType.group: {
          const group = await this.groupModel
            .findOne({
              _id: groupId,
              $or: [{ admins: owner }, { creator: owner }],
            })
            .session(session)
            .select('_id')
            .lean();
          if (!group) {
            throw new Error('Not allowed or group not found');
          }

          const response = await this.groupMagazine
            .findByIdAndUpdate(magazine._id, magazine)
            .session(session)
            .select('_id')
            .lean();
          return response?._id;
        }
        default: {
          throw new Error('Invalid owner type');
        }
      }
    } catch (error: any) {
      throw error;
    } finally {
      session.endSession();
    }
  }

  async updateTitleOfSectionById(
    sectionId: string,
    newTitle: string,
  ): Promise<void> {
    try {
      await this.magazineSection
        .updateOne({ _id: sectionId }, { $set: { title: newTitle } })
        .lean();
    } catch (error: any) {
      throw error;
    }
  }
}
