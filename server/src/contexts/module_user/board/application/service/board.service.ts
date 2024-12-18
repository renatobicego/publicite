import { Inject } from '@nestjs/common';


import { BoardRespositoryInterface } from '../../domain/repository/board.repository.interface';
import { BoardServiceInterface } from '../../domain/service/board.service.interface';
import { BoardRequest } from '../dto/HTTP-REQUEST/board.request';
import { BoardMapperServiceInterface } from '../../domain/service/mapper/board.service.mapper.inteface';
import {
  BoardGetAllResponse,
  BoardResponse,
} from '../dto/HTTP-RESPONSE/board.response';

import { UpdateBoardDto } from '../dto/HTTP-REQUEST/board.update';
import { MyLoggerService } from 'src/contexts/module_shared/logger/logger.service';

export class BoardService implements BoardServiceInterface {
  constructor(
    @Inject('BoardRepositoryInterface')
    private readonly boardRepository: BoardRespositoryInterface,
    @Inject('BoardMapperServiceInterface')
    private readonly boardMapper: BoardMapperServiceInterface,
    private readonly logger: MyLoggerService,
  ) { }
  async getBoardByAnnotationOrKeyword(
    board: string,
    limit: number,
    page: number,
  ): Promise<BoardGetAllResponse> {
    try {
      this.logger.log('Getting board by annotation or keyword: ' + board);
      return await this.boardRepository.getBoardByAnnotationOrKeyword(
        board,
        limit,
        page,
      );
    } catch (error: any) {
      throw error;
    }
  }
  async updateBoardById(
    id: string,
    owner: string,
    board: UpdateBoardDto,
  ): Promise<BoardResponse | null> {
    try {
      this.logger.log('Updating board with ID: ' + id);
      return await this.boardRepository.updateBoardById(id, owner, board);
    } catch (error: any) {
      this.logger.error(
        'An error was ocurred while trying to update board: ' + id,
      );
      throw error;
    }
  }
  async save(boardRequest: BoardRequest): Promise<BoardResponse> {
    try {
      this.logger.log('Saving new board for the user id: ' + boardRequest.user);
      const boardMapper = this.boardMapper.requestToEntitiy(boardRequest);
      const boardSaved = await this.boardRepository.save(boardMapper);
      return this.boardMapper.entityToResponse(boardSaved);
    } catch (error: any) {
      this.logger.error('An error was ocurred while trying to save board.');
      throw error;
    }

  }
}
