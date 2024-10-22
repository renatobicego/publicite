import { Inject, UseGuards } from '@nestjs/common';
import { Args, Mutation, Resolver, Query, Context } from '@nestjs/graphql';
import { ObjectId } from 'mongoose';

import { MagazineAdapterInterface } from '../../application/adapter/magazine.adapter.interface';
import { MagazineCreateRequest } from '../../application/adapter/dto/HTTP-REQUEST/magazine.create.request';
import { MagazineResponse } from '../../application/adapter/dto/HTTP-RESPONSE/magazine.reponse';
import { MagazineUpdateRequest } from '../../application/adapter/dto/HTTP-REQUEST/magazine.update.request';
import { PubliciteAuth } from 'src/contexts/shared/publicite_auth/publicite_auth';
import { ClerkAuthGuard } from 'src/contexts/clerk-auth/clerk.auth.guard';

@Resolver()
export class MagazineResolver {
  constructor(
    @Inject('MagazineAdapterInterface')
    private readonly magazineAdapter: MagazineAdapterInterface,
  ) {}

  @Mutation(() => String, {
    nullable: true,
    description: 'Agregar colaboradores a la revista',
  })
  async addColaboratorsToMagazine(
    @Args('newColaborators', { type: () => [String] })
    newColaborators: string[],
    @Args('magazineAdmin', { type: () => String })
    magazineAdmin: string,
    @Args('magazineId', { type: () => String })
    magazineId: string,
    @Context()
    context: any,
  ): Promise<any> {
    try {
      PubliciteAuth.authorize(context, magazineAdmin);
      await this.magazineAdapter.addCollaboratorsToMagazine(
        newColaborators,
        magazineId,
        magazineAdmin,
      );
      return 'Colaborators added';
    } catch (error: any) {
      throw error;
    }
  }

  @Mutation(() => String, {
    nullable: true,
    description: 'Eliminar colaboradores de la revista',
  })
  async deleteColaboratorsFromMagazine(
    @Args('colaboratorsToDelete', { type: () => [String] })
    colaboratorsToDelete: string[],
    @Args('magazineAdmin', { type: () => String })
    magazineAdmin: string,
    @Args('magazineId', { type: () => String })
    magazineId: string,
    @Context()
    context: any,
  ): Promise<any> {
    try {
      PubliciteAuth.authorize(context, magazineAdmin);
      await this.magazineAdapter.deleteCollaboratorsFromMagazine(
        colaboratorsToDelete,
        magazineId,
        magazineAdmin,
      );
      return 'Colaborators deleted';
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
  ): Promise<any> {
    try {
      PubliciteAuth.authorize(context, owner);
      return await this.magazineAdapter.updateMagazineById(magazineRequest);
    } catch (error: any) {
      throw error;
    }
  }
}

// @Mutation(() => String, {
//   nullable: true,
//   description: 'Agregar allowedCollaborators a la revista',
// })
// async addAllowedCollaboratorsToMagazine(
//   @Args('newAllowedColaborators', { type: () => [String] })
//   newAllowedColaborators: string[],
//   @Args('magazineAdmin', { type: () => String })
//   magazineAdmin: string,
//   @Args('magazineId', { type: () => String })
//   magazineId: string,
//   @Context()
//   context: any,
// ): Promise<any> {
//   try {
//     PubliciteAuth.authorize(context, magazineAdmin);
//     await this.magazineAdapter.addAllowedCollaboratorsToMagazine(
//       newAllowedColaborators,
//       magazineId,
//     );
//     return 'Colaborators added';
//   } catch (error: any) {
//     throw error;
//   }
// }

// @Mutation(() => String, {
//   nullable: true,
//   description: 'Eliminar allowed colaboradores de la revista',
// })
// async deleteAllowedCollaboratorsFromMagazine(
//   @Args('allowedCollaboratorsToDelete', { type: () => [String] })
//   allowedCollaboratorsToDelete: string[],
//   @Args('magazineAdmin', { type: () => String })
//   magazineAdmin: string,
//   @Args('magazineId', { type: () => String })
//   magazineId: string,
//   @Context()
//   context: any,
// ): Promise<any> {
//   try {
//     PubliciteAuth.authorize(context, magazineAdmin);
//     await this.magazineAdapter.deleteAllowedCollaboratorsFromMagazine(
//       allowedCollaboratorsToDelete,
//       magazineId,
//     );
//     return 'Colaborators deleted';
//   } catch (error: any) {
//     throw error;
//   }
// }
