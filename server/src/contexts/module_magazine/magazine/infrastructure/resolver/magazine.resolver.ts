import { ExecutionContext, Inject, UseGuards } from '@nestjs/common';
import { Args, Mutation, Resolver, Query, Context, } from '@nestjs/graphql';
import { ObjectId } from 'mongoose';

import { MagazineAdapterInterface } from '../../application/adapter/magazine.adapter.interface';
import { MagazineCreateRequest } from '../../application/adapter/dto/HTTP-REQUEST/magazine.create.request';
import { MagazineResponse } from '../../application/adapter/dto/HTTP-RESPONSE/magazine.reponse';
import { MagazineUpdateRequest } from '../../application/adapter/dto/HTTP-REQUEST/magazine.update.request';
import { PubliciteAuth } from 'src/contexts/module_shared/auth/publicite_auth/publicite_auth';
import { ClerkAuthGuard } from 'src/contexts/module_shared/auth/clerk-auth/clerk.auth.guard';
import { MagazineSectionCreateRequest } from '../../application/adapter/dto/HTTP-REQUEST/magazineSection.create.request';
import { OwnerType } from '../../domain/entity/enum/magazine.ownerType.enum';
import { CustomContextRequestInterface } from 'src/contexts/module_shared/auth/custom_request/custom.context.request.interface';



@Resolver()
export class MagazineResolver {
  constructor(
    @Inject('MagazineAdapterInterface')
    private readonly magazineAdapter: MagazineAdapterInterface,
  ) { }

  @Mutation(() => String, {
    nullable: true,
    description: 'Agregar nueva seccion en la revista',
  })
  @UseGuards(ClerkAuthGuard)
  async addNewMagazineSection(
    @Args('magazineAdmin', { type: () => String })
    magazineAdmin: string,
    @Args('magazineId', { type: () => String })
    magazineId: string,
    @Args('section', { type: () => MagazineSectionCreateRequest })
    section: MagazineSectionCreateRequest,
    @Context() context: { req: CustomContextRequestInterface },
    @Args('groupId', { type: () => String, nullable: true })
    groupId?: string,
  ): Promise<any> {
    try {
      const userRequestId = context.req.userRequestId;
      PubliciteAuth.authorize(userRequestId, magazineAdmin);
      await this.magazineAdapter.addNewMagazineSection(
        magazineAdmin,
        magazineId,
        section,
        groupId,
      );
      return 'Section added in magazine';
    } catch (error: any) {
      throw error;
    }
  }

  @Mutation(() => String, {
    nullable: true,
    description: 'Agregar post en la revista de usuario',
  })
  @UseGuards(ClerkAuthGuard)
  async addPostInUserMagazine(
    @Args('postId', { type: () => String })
    postId: string,
    @Args('magazineAdmin', { type: () => String })
    magazineAdmin: string,
    @Args('magazineId', { type: () => String })
    magazineId: string,
    @Args('sectionId', { type: () => String })
    sectionId: string,
    @Context() context: { req: CustomContextRequestInterface },
  ): Promise<any> {
    try {
      const userRequestId = context.req.userRequestId;
      PubliciteAuth.authorize(userRequestId, magazineAdmin);
      await this.magazineAdapter.addPostInUserMagazine(
        postId,
        magazineId,
        magazineAdmin,
        sectionId,
      );
      return 'Posts added in user magazine';
    } catch (error: any) {
      throw error;
    }
  }

  @Mutation(() => String, {
    nullable: true,
    description: 'Agregar post en la revista de grupo',
  })
  @UseGuards(ClerkAuthGuard)
  async addPostInGroupMagazine(
    @Args('postId', { type: () => [String] })
    postId: string,
    @Args('magazineAdmin', { type: () => String })
    magazineAdmin: string,
    @Args('magazineId', { type: () => String })
    magazineId: string,
    @Args('sectionId', { type: () => String })
    sectionId: string,
    @Context() context: { req: CustomContextRequestInterface },
  ): Promise<any> {
    try {
      const userRequestId = context.req.userRequestId;
      PubliciteAuth.authorize(userRequestId, magazineAdmin);
      await this.magazineAdapter.addPostInGroupMagazine(
        postId,
        magazineId,
        magazineAdmin,
        sectionId,
      );
      return 'Posts added in group magazine';
    } catch (error: any) {
      throw error;
    }
  }

  @Mutation(() => String, {
    nullable: true,
    description: 'Agregar colaboradores a la revista de usuario',
  })
  async addCollaboratorsToUserMagazine(
    @Args('newCollaborators', { type: () => [String] })
    newCollaborators: string[],
    @Args('magazineAdmin', { type: () => String })
    magazineAdmin: string,
    @Args('magazineId', { type: () => String })
    magazineId: string,
    @Context() context: { req: CustomContextRequestInterface },
  ): Promise<any> {
    try {
      const userRequestId = context.req.userRequestId;
      PubliciteAuth.authorize(userRequestId, magazineAdmin);
      await this.magazineAdapter.addCollaboratorsToUserMagazine(
        newCollaborators,
        magazineId,
        magazineAdmin,
      );
      return 'Collaborators added in user magazine';
    } catch (error: any) {
      throw error;
    }
  }

  @Mutation(() => String, {
    nullable: true,
    description: 'Agregar allowedCollaborators a la revista de grupo',
  })
  async addAllowedCollaboratorsToGroupMagazine(
    @Args('newallowedCollaborators', { type: () => [String] })
    newallowedCollaborators: string[],
    @Args('magazineId', { type: () => String })
    magazineId: string,
    @Args('magazineAdmin', { type: () => String })
    magazineAdmin: string,
    @Context() context: { req: CustomContextRequestInterface },
  ): Promise<any> {
    try {
      const userRequestId = context.req.userRequestId;
      PubliciteAuth.authorize(userRequestId, magazineAdmin);
      await this.magazineAdapter.addAllowedCollaboratorsToGroupMagazine(
        newallowedCollaborators,
        magazineId,
        magazineAdmin,
      );
      return 'Collaborators added in group magazine';
    } catch (error: any) {
      throw error;
    }
  }

  @Mutation(() => String, {
    nullable: true,
    description: 'Eliminar colaboradores de la revista de usuario',
  })
  async deleteCollaboratorsFromUserMagazine(
    @Args('collaboratorsToDelete', { type: () => [String] })
    collaboratorsToDelete: string[],
    @Args('magazineId', { type: () => String })
    magazineId: string,
    @Args('magazineAdmin', { type: () => String })
    magazineAdmin: string,
    @Context() context: { req: CustomContextRequestInterface },
  ): Promise<any> {
    try {
      const userRequestId = context.req.userRequestId;
      PubliciteAuth.authorize(userRequestId, magazineAdmin);
      await this.magazineAdapter.deleteCollaboratorsFromMagazine(
        collaboratorsToDelete,
        magazineId,
        magazineAdmin,
      );
      return 'Collaborators deleted in user magazine';
    } catch (error: any) {
      throw error;
    }
  }
  @Mutation(() => String, {
    nullable: true,
    description: 'Eliminar allowed colaboradores de la revista de grupo',
  })
  async deleteAllowedCollaboratorsFromMagazineGroup(
    @Args('allowedCollaboratorsToDelete', { type: () => [String] })
    allowedCollaboratorsToDelete: string[],
    @Args('magazineId', { type: () => String })
    magazineId: string,
    @Args('magazineAdmin', { type: () => String })
    magazineAdmin: string,
    @Context() context: { req: CustomContextRequestInterface },
  ): Promise<any> {
    try {
      const userRequestId = context.req.userRequestId;
      PubliciteAuth.authorize(userRequestId, magazineAdmin);
      await this.magazineAdapter.deleteAllowedCollaboratorsFromMagazineGroup(
        allowedCollaboratorsToDelete,
        magazineId,
        magazineAdmin,
      );
      return 'Collaborators deleted in group magazine';
    } catch (error: any) {
      throw error;
    }
  }

  @Mutation(() => String, {
    nullable: true,
    description:
      'Eliminar secciones de la revista, siendo un colaborador de la misma o un administrador de del grupo de la revista',
  })
  async deleteSectionFromMagazineById(
    @Args('sectionIdsToDelete', { type: () => [String] })
    sectionIdsToDelete: string[],
    @Args('magazineId', { type: () => String })
    magazineId: string,
    @Context() context: { req: CustomContextRequestInterface },
    @Args('allowedCollaboratorId', { type: () => String, nullable: true })
    allowedCollaboratorId?: string,
    @Args('userMagazineAllowed', { type: () => String, nullable: true })
    userMagazineAllowed?: string,
  ): Promise<any> {
    try {
      const userRequestId = context.req.userRequestId;
      if (!allowedCollaboratorId && userMagazineAllowed) {
        PubliciteAuth.authorize(userRequestId, userMagazineAllowed);
        await this.magazineAdapter.deleteSectionFromMagazineById(
          sectionIdsToDelete,
          magazineId,
          userMagazineAllowed,
        );
      } else if (allowedCollaboratorId) {
        PubliciteAuth.authorize(userRequestId, allowedCollaboratorId);
        await this.magazineAdapter.deleteSectionFromMagazineById(
          sectionIdsToDelete,
          magazineId,
          allowedCollaboratorId,
        );
      } else {
        throw new Error('Unauthorized');
      }
      return 'Sections deleted';
    } catch (error: any) {
      throw error;
    }
  }

  @Mutation(() => String, {
    nullable: true,
    description: 'Crear una revista',
  })
  @UseGuards(ClerkAuthGuard)
  async createMagazine(
    @Args('magazineCreateRequest', { type: () => MagazineCreateRequest })
    magazineRequest: MagazineCreateRequest,
    @Context() context: { req: CustomContextRequestInterface },
  ): Promise<any> {
    try {
      const userRequestId = context.req.userRequestId;
      return await this.magazineAdapter.createMagazine(magazineRequest, userRequestId);
    } catch (error: any) {
      throw error;
    }
  }

  @Query(() => MagazineResponse, {
    nullable: true,
    description: 'Obtener una revista',
  })
  async getMagazineByMagazineId(
    @Args('id', { type: () => String })
    id: ObjectId,
  ): Promise<Partial<MagazineResponse> | null> {
    try {
      return await this.magazineAdapter.findMagazineByMagazineId(id);
    } catch (error: any) {
      throw error;
    }
  }

  @Query(() => [MagazineResponse], {
    nullable: true,
    description: 'Obtener todas las revistas en las que un usuario puede colaborar',
  })
  @UseGuards(ClerkAuthGuard)
  async getAllMagazinesByUserId(
    @Args('userId', { type: () => String })
    userId: string,
  ): Promise<MagazineResponse[] | []> {
    try {
      return await this.magazineAdapter.findAllMagazinesByUserId(userId);
    } catch (error: any) {
      throw error;
    }
  }


  @Mutation(() => String, {
    nullable: true,
    description: 'Actualizar una revista',
  })
  @UseGuards(ClerkAuthGuard)
  async updateMagazineById(
    @Args('magazineUpdateRequest', { type: () => MagazineUpdateRequest })
    magazineRequest: MagazineUpdateRequest,
    @Args('owner', { type: () => String })
    owner: string,
    @Context() context: { req: CustomContextRequestInterface },
    @Args('groupId', {
      type: () => String,
      description: 'El id del grupo en el caso de que la revista sea de grupo',
      nullable: true,
    })
    groupId?: string,
  ): Promise<any> {
    try {
      const userRequestId = context.req.userRequestId;
      PubliciteAuth.authorize(userRequestId, owner);
      return await this.magazineAdapter.updateMagazineById(
        magazineRequest,
        owner,
        groupId,
      );
    } catch (error: any) {
      throw error;
    }
  }



  @Mutation(() => String, {
    nullable: true,
    description: 'Actualizar el nombre de una seccion en una revista',
  })
  @UseGuards(ClerkAuthGuard)
  async updateTitleOfSectionById(
    @Args('sectionId', { type: () => String })
    sectionId: string,
    @Args('newTitle', { type: () => String })
    newTitle: string,
    @Args('ownerType', { type: () => OwnerType })
    ownerType: OwnerType,
    @Context() context: { req: CustomContextRequestInterface },
    @Args('magazineId', { type: () => String, nullable: true })
    magazineId?: string,
  ): Promise<any> {
    try {
      const userRequestId = context.req.userRequestId;
      return await this.magazineAdapter.updateTitleOfSectionById(
        sectionId,
        newTitle,
        userRequestId,
        ownerType,
        magazineId
      )
    } catch (error: any) {
      throw error;
    }
  }



  @Mutation(() => String, {
    nullable: true,
    description: 'Eliminar posts de una seccion en una revista',
  })
  @UseGuards(ClerkAuthGuard)
  async deletePostInMagazineSection(
    @Args('postIdToRemove', { type: () => String })
    postIdToRemove: string,
    @Args('sectionId', { type: () => String })
    sectionId: string,
    @Args('ownerType', { type: () => OwnerType })
    ownerType: OwnerType,
    @Context() context: { req: CustomContextRequestInterface },
    @Args('magazineId', { type: () => String, nullable: true })
    magazineId?: string,
  ): Promise<any> {
    try {
      const userRequestId = context.req.userRequestId;
      await this.magazineAdapter.deletePostInMagazineSection(
        postIdToRemove,
        sectionId,
        ownerType,
        userRequestId,
        magazineId
      )
      return 'Post remove from section succesfully';
    } catch (error: any) {
      throw error;
    }
  }




}
