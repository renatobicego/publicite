import { Inject, UseGuards } from '@nestjs/common';
import { Args, Mutation, Resolver, Query, Context } from '@nestjs/graphql';
import { ClerkAuthGuard } from 'src/contexts/module_shared/auth/clerk-auth/clerk.auth.guard';
import { PubliciteAuth } from 'src/contexts/module_shared/auth/publicite_auth/publicite_auth';
import { BoardAdapterInterface } from '../../../application/adapter/board.adapter.interface';
import { UpdateBoardDto } from '../../../application/dto/HTTP-REQUEST/board.update';
import { BoardGetAllResponse } from '../../../application/dto/HTTP-RESPONSE/board.response';
import { Board } from '../../../domain/entity/board.entity';


//´Provee instrucciones para transformar las insttrucciones provenientes del cliente en data que graph puede utilizar
// Los resolvers son similareas a los controladores traicionales de un rest enpoint. SON PROVIDERS para nest

@Resolver()
export class BoardResolver {
  //Definimos las query
  constructor(
    @Inject('BoardAdapterInterface')
    private readonly boardAdapter: BoardAdapterInterface,
  ) {}

  @Mutation(() => Board, {
    nullable: true,
    description: 'Actualiza el board del usuario',
  })
  @UseGuards(ClerkAuthGuard)
  async updateBoardById(
    @Args('id', { type: () => String }) id: string,
    @Args('ownerId', { type: () => String }) ownerId: string,
    @Args('boardData', { type: () => UpdateBoardDto })
    boardData: UpdateBoardDto,
    @Context() context: any,
  ): Promise<any> {
    try {
      PubliciteAuth.authorize(context, ownerId);
      return await this.boardAdapter.updateBoardById(id, boardData);
    } catch (error: any) {
      throw error;
    }
  }

  @Query(() => BoardGetAllResponse, {
    nullable: true,
    description: 'Obtener un board por anotaciones o palabras clave',
  })
  async getBoardByAnnotationOrKeyword(
    @Args('board', { type: () => String }) board: string,
    @Args('limit', { type: () => Number }) limit: number,
    @Args('page', { type: () => Number }) page: number,
  ): Promise<BoardGetAllResponse> {
    try {
      return await this.boardAdapter.getBoardByAnnotationOrKeyword(
        board,
        limit,
        page,
      );
    } catch (error: any) {
      throw error;
    }
  }
}