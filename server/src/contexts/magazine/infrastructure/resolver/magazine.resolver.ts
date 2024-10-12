import { Inject } from '@nestjs/common';
import { Args, Mutation, Resolver, Query, Context } from '@nestjs/graphql';
import { ObjectId } from 'mongoose';

import { MagazineAdapterInterface } from '../../application/adapter/magazine.adapter.interface';
import { MagazineCreateRequest } from '../../application/adapter/dto/HTTP-REQUEST/magazine.create.request';
import { MagazineResponse } from '../../application/adapter/dto/HTTP-RESPONSE/magazine.reponse';
import { MagazineUpdateRequest } from '../../application/adapter/dto/HTTP-REQUEST/magazine.update.request';
import { PubliciteAuth } from 'src/contexts/shared/publicite_auth/publicite_auth';

@Resolver()
export class MagazineResolver {
  constructor(
    @Inject('MagazineAdapterInterface')
    private readonly magazineAdapter: MagazineAdapterInterface,
  ) {}

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
    description: 'Crear una revista',
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
  async updateMagazineById(
    @Args('magazineUpdateRequest', { type: () => MagazineUpdateRequest })
    magazineRequest: MagazineUpdateRequest,
    @Context() context: any,
  ): Promise<any> {
    try {
      PubliciteAuth.authorize(context, magazineRequest.user);
      return await this.magazineAdapter.updateMagazineById(magazineRequest);
    } catch (error: any) {
      throw error;
    }
  }
}
