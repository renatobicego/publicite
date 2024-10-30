import { Inject, UseGuards } from '@nestjs/common';
import { Args, Mutation, Resolver, Query, Context } from '@nestjs/graphql';
import { ClerkAuthGuard } from 'src/contexts/module_shared/auth/clerk-auth/clerk.auth.guard';

import { PostAdapterInterface } from 'src/contexts/module_post/post/application/post/adapter/post.adapter.interface';
import { PostUpdateRequest } from 'src/contexts/module_post/post/application/post/dto/HTTP-REQUEST/post.update.request';
import { Post_response_graphql_model } from 'src/contexts/module_post/post/application/post/dto/HTTP-RESPONSE/post.response.graphql';
import { PostFindAllResponse } from 'src/contexts/module_post/post/application/post/dto/HTTP-RESPONSE/findAll-response/post.findAll.response';
import { Post_Full_Graphql_Model } from 'src/contexts/module_post/post/domain/post/entity/models_graphql/post.full.grapql.model';
import { PostType } from 'src/contexts/module_post/post/domain/post/entity/enum/post-type.enum';
import { PubliciteAuth } from 'src/contexts/module_shared/auth/publicite_auth/publicite_auth';

@Resolver('Post')
export class PostResolver {
  constructor(
    @Inject('PostAdapterInterface')
    private readonly postAdapter: PostAdapterInterface,
  ) {}

  @Mutation(() => String, {
    nullable: true,
    description: 'eliminar un post por id',
  })
  @UseGuards(ClerkAuthGuard)
  async deletePostById(
    @Args('id', { type: () => String })
    id: string,
    @Args('id', { type: () => String })
    author_id: string,
    @Context() context: any,
  ): Promise<any> {
    try {
      PubliciteAuth.authorize(context, author_id);
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
  @UseGuards(ClerkAuthGuard)
  async updatePostById(
    @Args('postUpdate', { type: () => PostUpdateRequest })
    postUpdate: PostUpdateRequest,
    @Args('id', { type: () => String })
    id: string,
    @Args('author_id', { type: () => String })
    admin_id: string,
    @Context() context: any,
  ): Promise<any> {
    try {
      PubliciteAuth.authorize(context, admin_id);
      return await this.postAdapter.updatePostById(postUpdate, id);
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

  @Query(() => Post_response_graphql_model, {
    nullable: true,
    description: 'Obtener Post por su Id',
  })
  async findPostById(
    @Args('id', { type: () => String }) id: string,
  ): Promise<any> {
    try {
      let post = await this.postAdapter.findPostById(id);
      return post;
    } catch (error: any) {
      throw error;
    }
  }

  @Query(() => PostFindAllResponse, {
    nullable: true,
    description: 'Buscar todos los post',
  })
  async findAllPostByPostType(
    @Args('page', { type: () => Number }) page: number,
    @Args('limit', { type: () => Number }) limit: number,
    @Args('postType', { type: () => PostType }) postType: PostType,
    @Args('searchTerm', { type: () => String, nullable: true })
    searchTerm?: string,
  ): Promise<any> {
    try {
      return await this.postAdapter.findAllPostByPostType(
        page,
        limit,
        postType,
        searchTerm,
      );
    } catch (error: any) {
      throw error;
    }
  }
}
