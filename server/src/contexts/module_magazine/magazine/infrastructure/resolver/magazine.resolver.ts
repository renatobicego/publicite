import { Inject, UseGuards } from '@nestjs/common';
import { Args, Mutation, Resolver, Query, Context } from '@nestjs/graphql';
import { ObjectId } from 'mongoose';

import { MagazineAdapterInterface } from '../../application/adapter/magazine.adapter.interface';
import { MagazineCreateRequest } from '../../application/adapter/dto/HTTP-REQUEST/magazine.create.request';
import { MagazineResponse } from '../../application/adapter/dto/HTTP-RESPONSE/magazine.reponse';
import { MagazineUpdateRequest } from '../../application/adapter/dto/HTTP-REQUEST/magazine.update.request';
import { PubliciteAuth } from 'src/contexts/module_shared/auth/publicite_auth/publicite_auth';
import { ClerkAuthGuard } from 'src/contexts/module_shared/auth/clerk-auth/clerk.auth.guard';
import { MagazineSectionCreateRequest } from '../../application/adapter/dto/HTTP-REQUEST/magazineSection.create.request';

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
  async addNewMagazineSection(
    @Args('magazineAdmin', { type: () => String })
    magazineAdmin: string,
    @Args('magazineId', { type: () => String })
    magazineId: string,
    @Args('section', { type: () => String })
    section: MagazineSectionCreateRequest,
    @Context()
    context: any,
    @Args('groupId', { type: () => String, nullable: true })
    groupId?: string,
  ): Promise<any> {
    try {
      PubliciteAuth.authorize(context, magazineAdmin);
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
  async addPostInUserMagazine(
    @Args('postId', { type: () => [String] })
    postId: string,
    @Args('magazineAdmin', { type: () => String })
    magazineAdmin: string,
    @Args('magazineId', { type: () => String })
    magazineId: string,
    @Args('sectionId', { type: () => String })
    sectionId: string,
    @Context()
    context: any,
  ): Promise<any> {
    try {
      PubliciteAuth.authorize(context, magazineAdmin);
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
  async addPostInGroupMagazine(
    @Args('postId', { type: () => [String] })
    postId: string,
    @Args('magazineAdmin', { type: () => String })
    magazineAdmin: string,
    @Args('magazineId', { type: () => String })
    magazineId: string,
    @Args('sectionId', { type: () => String })
    sectionId: string,
    @Context()
    context: any,
  ): Promise<any> {
    try {
      PubliciteAuth.authorize(context, magazineAdmin);
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
    @Context()
    context: any,
  ): Promise<any> {
    try {
      PubliciteAuth.authorize(context, magazineAdmin);
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
    @Context()
    context: any,
  ): Promise<any> {
    try {
      PubliciteAuth.authorize(context, magazineAdmin);
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
    @Context()
    context: any,
  ): Promise<any> {
    try {
      PubliciteAuth.authorize(context, magazineAdmin);
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
    @Context()
    context: any,
  ): Promise<any> {
    try {
      PubliciteAuth.authorize(context, magazineAdmin);
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
    @Context()
    context: any,
    @Args('allowedCollaboratorId', { type: () => String, nullable: true })
    allowedCollaboratorId?: string,
    @Args('userMagazineAllowed', { type: () => String, nullable: true })
    userMagazineAllowed?: string,
  ): Promise<any> {
    try {
      if (!allowedCollaboratorId && userMagazineAllowed) {
        //PubliciteAuth.authorize(context, userMagazineAllowed);
        await this.magazineAdapter.deleteSectionFromMagazineById(
          sectionIdsToDelete,
          magazineId,
          userMagazineAllowed,
        );
      } else if (allowedCollaboratorId) {
        //PubliciteAuth.authorize(context, allowedCollaboratorId);
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
  async createMagazine(
    @Args('magazineCreateRequest', { type: () => MagazineCreateRequest })
    magazineRequest: MagazineCreateRequest,
  ): Promise<any> {
    try {
      return await this.magazineAdapter.createMagazine(magazineRequest);
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

  @Query(() => MagazineResponse, {
    nullable: true,
    description: 'Obtener todas las revistas en las que un usuario puede colaborar',
  })
  @UseGuards(ClerkAuthGuard)
  async getMyMagazinesByUserId(
    @Args('id', { type: () => String })
    id: ObjectId,
  ): Promise<any> {
    try {
      return await this.magazineAdapter.findAllMagazinesByUserId(id);
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
    @Context() context: any,
    @Args('groupId', {
      type: () => String,
      description: 'El id del grupo en el caso de que la revista sea de grupo',
      nullable: true,
    })
    groupId?: string,
  ): Promise<any> {
    try {
      PubliciteAuth.authorize(context, owner);
      return await this.magazineAdapter.updateMagazineById(
        magazineRequest,
        owner,
        groupId,
      );
    } catch (error: any) {
      throw error;
    }
  }
}
