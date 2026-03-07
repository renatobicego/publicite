import { Inject, UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { ClerkAuthGuard } from 'src/contexts/module_shared/auth/clerk-auth/clerk.auth.guard';
import { NoveltyAdapterInterface } from '../../application/adapter/novelty.adapter.interface';
import { NoveltyRequest } from '../../application/adapter/dto/HTTP-REQUEST/novelty.request';
import { NoveltyUpdateRequest } from '../../application/adapter/dto/HTTP-REQUEST/novelty.update.request';
import { NoveltyResponse } from '../../application/adapter/dto/HTTP-RESPONSE/novelty.response';

@Resolver()
export class NoveltyResolver {
  constructor(
    @Inject('NoveltyAdapterInterface')
    private readonly noveltyAdapter: NoveltyAdapterInterface,
  ) {}

  @Mutation(() => NoveltyResponse, {
    nullable: true,
    description: 'Crear una novedad',
  })
  @UseGuards(ClerkAuthGuard)
  async createNewNovelty(
    @Args('noveltyDto', { type: () => NoveltyRequest })
    noveltyRequest: NoveltyRequest,
  ): Promise<NoveltyResponse> {
    try {
      return await this.noveltyAdapter.createNovelty(noveltyRequest);
    } catch (error: any) {
      throw error;
    }
  }

  @Query(() => NoveltyResponse, {
    nullable: true,
    description: 'Obtener novedad por id',
  })
  @UseGuards(ClerkAuthGuard)
  async getNoveltyById(
    @Args('id', { type: () => String })
    id: string,
  ): Promise<NoveltyResponse | null> {
    try {
      return await this.noveltyAdapter.getNoveltyById(id);
    } catch (error: any) {
      throw error;
    }
  }

  @Query(() => [NoveltyResponse], {
    nullable: true,
    description: 'Obtener todas las novedades',
  })
  @UseGuards(ClerkAuthGuard)
  async getAllNovelties(): Promise<NoveltyResponse[]> {
    try {
      return await this.noveltyAdapter.getAllNovelties();
    } catch (error: any) {
      throw error;
    }
  }

  @Mutation(() => String, {
    nullable: true,
    description: 'Actualizar una novedad',
  })
  @UseGuards(ClerkAuthGuard)
  async updateNoveltyById(
    @Args('noveltyToUpdate', { type: () => NoveltyUpdateRequest })
    noveltyToUpdate: NoveltyUpdateRequest,
  ): Promise<string> {
    try {
      return await this.noveltyAdapter.updateNoveltyById(noveltyToUpdate);
    } catch (error: any) {
      throw error;
    }
  }

  @Mutation(() => String, {
    nullable: true,
    description: 'Eliminar una novedad por su id',
  })
  @UseGuards(ClerkAuthGuard)
  async deleteNoveltyById(
    @Args('id', { type: () => String })
    id: string,
  ): Promise<string> {
    try {
      return await this.noveltyAdapter.deleteNoveltyById(id);
    } catch (error: any) {
      throw error;
    }
  }
}
