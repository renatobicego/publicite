import { Inject } from '@nestjs/common';

import { BoardAdapterInterface } from 'src/contexts/board/application/adapter/board.adapter.interface';
import { BoardRequest } from 'src/contexts/board/application/dto/HTTP-REQUEST/board.request';
import { UpdateBoardDto } from 'src/contexts/board/application/dto/HTTP-REQUEST/board.update';
import { BoardResponse } from 'src/contexts/board/application/dto/HTTP-RESPONSE/board.response';
import { BoardServiceInterface } from 'src/contexts/board/domain/service/board.service.interface';

export class BoardAdapter implements BoardAdapterInterface {
  constructor(
    @Inject('BoardServiceInterface')
    private readonly boardService: BoardServiceInterface,
  ) {}
  async updateBoardById(
    id: string,
    board: UpdateBoardDto,
  ): Promise<BoardResponse> {
    try {
      return await this.boardService.updateBoardById(id, board);
    } catch (error: any) {
      throw error;
    }
  }

  async save(board: BoardRequest): Promise<BoardResponse> {
    try {
      return await this.boardService.save(board);
    } catch (error: any) {
      throw error;
    }
  }
}
