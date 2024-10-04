import { Inject } from '@nestjs/common';
import { Args, Mutation, Resolver, Query } from '@nestjs/graphql';

import { PostUpdateRequest } from 'src/contexts/post/application/adapter/dto/HTTP-REQUEST/post.update.request';
import { PostAdapterInterface } from 'src/contexts/post/application/adapter/post.adapter.interface';
import { Post_Full_Graphql_Model } from 'src/contexts/post/domain/entity/models_graphql/post.full.grapql.model';

@Resolver('Post')
export class PostResolver {
  constructor(
    @Inject('PostAdapterInterface')
    private readonly postAdapter: PostAdapterInterface,
  ) {}

  @Mutation(() => String, {
    nullable: true,
    description: 'Actualizar un post',
  })
  async deletePostById(
    @Args('id', { type: () => String })
    id: string,
    cookie?: any,
  ): Promise<any> {
    try {
      await this.postAdapter.deletePostById(id);
      return 'Eliminado con exito';
    } catch (error: any) {
      throw error;
    }
  }

  @Mutation(() => String, {
    nullable: true,
    description: 'Actualizar un post',
  })
  async updatePostById(
    @Args('postUpdate', { type: () => PostUpdateRequest })
    postUpdate: PostUpdateRequest,
    @Args('id', { type: () => String })
    id: string,
    cookie?: any,
  ): Promise<any> {
    try {
      return await this.postAdapter.updatePostById(postUpdate, id, cookie);
    } catch (error: any) {
      throw error;
    }
  }

  @Query(() => [Post_Full_Graphql_Model], {
    nullable: true,
    description: 'Obtener Post por autor',
  })
  async findPostsByAuthorId(
    @Args('authorId', { type: () => String }) authorId: string,
  ): Promise<any> {
    try {
      return await this.postAdapter.findPostsByAuthorId(authorId);
    } catch (error: any) {
      throw error;
    }
  }
}
