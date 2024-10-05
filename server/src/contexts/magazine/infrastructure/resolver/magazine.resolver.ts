import { Inject } from '@nestjs/common';
import { Args, Mutation, Resolver, Query } from '@nestjs/graphql';

import { MagazineAdapterInterface } from '../../application/adapter/magazine.adapter.interface';
import { MagazineCreateRequest } from '../../application/adapter/dto/HTTP-REQUEST/magazine.create.request';
import { ObjectId } from 'mongoose';
import { MagazineResponse } from '../../application/adapter/dto/HTTP-RESPONSE/magazine.reponse';

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
      await this.magazineAdapter.createMagazine(magazineRequest);
      return 'creado';
    } catch (error: any) {
      throw error;
    }
  }

  @Query(() => [MagazineResponse], {
    nullable: true,
    description: 'Crear una revista',
  })
  async getMagazineByMagazineId(
    @Args('id', { type: () => String })
    id: ObjectId,
  ): Promise<Partial<MagazineResponse>[] | []> {
    try {
      return await this.magazineAdapter.findMagazineByMagazineId(id);
    } catch (error: any) {
      throw error;
    }
  }
}
