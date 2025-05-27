import { Inject, UseGuards } from '@nestjs/common';
import { Args, Mutation, Resolver, Query, Context } from '@nestjs/graphql';
import { ClerkAuthGuard } from 'src/contexts/module_shared/auth/clerk-auth/clerk.auth.guard';
import { BoardAdapterInterface } from '../../../application/adapter/board.adapter.interface';
import { UpdateBoardDto } from '../../../application/dto/HTTP-REQUEST/board.update';
import { BoardGetAllResponse } from '../../../application/dto/HTTP-RESPONSE/board.response';
import { Board } from '../../../domain/entity/board.entity';
import { CustomContextRequestInterface } from 'src/contexts/module_shared/auth/custom_request/custom.context.request.interface';
import { BoardRequest } from '../../../application/dto/HTTP-REQUEST/board.request';


@Resolver()
export class BoardResolver {

  constructor(
    @Inject('BoardAdapterInterface')
    private readonly boardAdapter: BoardAdapterInterface,
  ) { }


  @Mutation(() => Board, {
    nullable: true,
    description: 'Crear una pizarra',
  })
  @UseGuards(ClerkAuthGuard)
  async createBoard(
    @Args('boardRequest', { type: () => BoardRequest })
    boardRequest: BoardRequest,
    @Context() context: { req: CustomContextRequestInterface },
  ): Promise<any> {
    try {
      const userRequestId = context.req.userRequestId;
      boardRequest.user = userRequestId;
      return await this.boardAdapter.save(boardRequest);
    } catch (error: any) {
      throw error;
    }
  }

  @Query(() => BoardGetAllResponse, {
    nullable: true,
    description: 'Obtener un board por anotaciones o palabras clave',
  })
  @UseGuards(ClerkAuthGuard)
  async getBoardByAnnotationOrKeyword(
    @Args('board', { type: () => String }) board: string,
    @Args('limit', { type: () => Number }) limit: number,
    @Args('page', { type: () => Number }) page: number,
    @Context() context: { req: CustomContextRequestInterface },
  ): Promise<BoardGetAllResponse> {
    try {
      const userRequestId = context.req.userRequestId ?? null
      const isUserRegister = context.req.isUserRegister ?? false
      return await this.boardAdapter.getBoardByAnnotationOrKeyword(
        board,
        limit,
        page,
        userRequestId,
        isUserRegister
      );
    } catch (error: any) {
      throw error;
    }
  }


  @Mutation(() => Board, {
    nullable: true,
    description: 'Actualiza el board del usuario',
  })
  @UseGuards(ClerkAuthGuard)
  async updateBoardById(
    @Args('id', { type: () => String }) id: string,
    @Args('boardData', { type: () => UpdateBoardDto })
    boardData: UpdateBoardDto,
    @Context() context: { req: CustomContextRequestInterface },
  ): Promise<any> {
    try {
      const userRequestId = context.req.userRequestId;
      return await this.boardAdapter.updateBoardById(id, userRequestId, boardData);
    } catch (error: any) {
      throw error;
    }
  }








}
