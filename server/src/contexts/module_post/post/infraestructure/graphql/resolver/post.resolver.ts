import { Inject, UseGuards } from '@nestjs/common';
import { Args, Mutation, Resolver, Query, Context } from '@nestjs/graphql';
import { ClerkAuthGuard } from 'src/contexts/module_shared/auth/clerk-auth/clerk.auth.guard';

import { PostAdapterInterface } from 'src/contexts/module_post/post/application/adapter/post.adapter.interface';
import { PostUpdateRequest } from 'src/contexts/module_post/post/application/dto/HTTP-REQUEST/post.update.request';
import { Post_response_graphql_model } from 'src/contexts/module_post/post/application/dto/HTTP-RESPONSE/post.response.graphql';
import { PostFindAllResponse } from 'src/contexts/module_post/post/application/dto/HTTP-RESPONSE/findAll-response/post.findAll.response';
import { Post_Full_Graphql_Model } from 'src/contexts/module_post/post/domain/entity/models_graphql/post.full.grapql.model';
import { PostType } from 'src/contexts/module_post/post/domain/entity/enum/post-type.enum';
import { PubliciteAuth } from 'src/contexts/module_shared/auth/publicite_auth/publicite_auth';
import { CustomContextRequestInterface } from 'src/contexts/module_shared/auth/custom_request/custom.context.request.interface';

@Resolver('Post')
export class PostResolver {
  constructor(
    @Inject('PostAdapterInterface')
    private readonly postAdapter: PostAdapterInterface,
  ) { }

  @Mutation(() => String, {
    nullable: true,
    description: 'eliminar un post por id',
  })
  @UseGuards(ClerkAuthGuard)
  async deletePostById(
    @Args('id', { type: () => String })
    id: string,
    @Args('author_id', { type: () => String })
    author_id: string,
    @Context() context: { req: CustomContextRequestInterface },
  ): Promise<any> {
    try {
      const userRequestId = context.req.userRequestId;
      if (!author_id) throw new Error('author_id is required');
      PubliciteAuth.authorize(userRequestId, author_id);
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
    @Context() context: { req: CustomContextRequestInterface },
  ): Promise<any> {
    try {
      const userRequestId = context.req.userRequestId;
      if (!admin_id) throw new Error('admin_id is required');
      PubliciteAuth.authorize(userRequestId, admin_id);
      return await this.postAdapter.updatePostById(postUpdate, id);
    } catch (error: any) {
      throw error;
    }
  }

  @Mutation(() => String, {
    nullable: true,
    description: 'Incrementa el endDate de un post por su id',
  })
  @UseGuards(ClerkAuthGuard)
  async updateEndDate(
    @Args('postId', { type: () => String })
    postId: string,
    @Context() context: { req: CustomContextRequestInterface },
  ): Promise<any> {
    try {
      const userRequestId = context.req.userRequestId;
      return await this.postAdapter.updateEndDateFromPostById(postId, userRequestId);

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
      return await this.postAdapter.findPostById(id);
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
