import { Inject } from '@nestjs/common';
import { Args, Mutation, Resolver } from '@nestjs/graphql';

import { MagazineAdapterInterface } from '../../application/adapter/magazine.adapter.interface';
import { MagazineCreateRequest } from '../../application/adapter/dto/HTTP-REQUEST/magazine.create.request';

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
  async createPersonalMagazine(
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
}
