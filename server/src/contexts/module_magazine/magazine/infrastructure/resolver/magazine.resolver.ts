import { Inject, UseGuards } from '@nestjs/common';
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
import { OnEvent } from '@nestjs/event-emitter';
import { MagazineCreateResponse } from '../../application/adapter/dto/HTTP-RESPONSE/magazine.create.response';




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
      return await this.magazineAdapter.addNewMagazineSection(
        magazineAdmin,
        magazineId,
        section,
        groupId,
      );

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
    description:
      'Eliminar secciones de la revista, siendo un colaborador de la misma o un administrador de del grupo de la revista',
  })
  @UseGuards(ClerkAuthGuard)
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
      if (allowedCollaboratorId) {
        PubliciteAuth.authorize(userRequestId, allowedCollaboratorId);
        await this.magazineAdapter.deleteSectionFromMagazineById(
          sectionIdsToDelete,
          magazineId,
          "group",
          userRequestId,
        );
      } else if (userMagazineAllowed) {
        PubliciteAuth.authorize(userRequestId, userMagazineAllowed);
        await this.magazineAdapter.deleteSectionFromMagazineById(
          sectionIdsToDelete,
          magazineId,
          "user",
          userRequestId,
        );
      } else {
        return 'You are not allowed to delete this section';
      }

      return 'Sections deleted';
    } catch (error: any) {
      throw error;
    }
  }

  @Mutation(() => MagazineCreateResponse, {
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
  @UseGuards(ClerkAuthGuard)
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
        userRequestId,
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


  @Mutation(() => String, {
    nullable: true,
    description: 'Eliminar una revistga por su id, para esto debes ser creador de la revista, de grupo o usuario admin',
  })
  @UseGuards(ClerkAuthGuard)
  async deleteMagazineByMagazineId(
    @Args('magazineId', { type: () => String })
    magazineId: string,
    @Args('ownerType', { type: () => String })
    ownerType: string,
    @Context() context: { req: CustomContextRequestInterface },
  ): Promise<string> {
    try {
      const userRequestId = context.req.userRequestId;
      await this.magazineAdapter.deleteMagazineByMagazineId(magazineId, userRequestId, ownerType);
      return 'Magazine deleted succesfully';
    } catch (error: any) {
      throw error;
    }
  }


  @Mutation(() => String, {
    nullable: true,
    description: 'Salir de la revista, solo para quienes colaboran en ellas.',
  })
  @UseGuards(ClerkAuthGuard)
  async exitMagazineByMagazineId(
    @Args('magazineId', { type: () => String })
    magazineId: string,
    @Args('ownerType', { type: () => String })
    ownerType: string,
    @Context() context: { req: CustomContextRequestInterface },
  ): Promise<string> {
    try {
      const userRequestId = context.req.userRequestId;
      await this.magazineAdapter.exitMagazineByMagazineId(magazineId, userRequestId, ownerType);
      return 'Magazine deleted succesfully';
    } catch (error: any) {
      throw error;
    }
  }



}
