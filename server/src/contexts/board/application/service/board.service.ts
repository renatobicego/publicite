import { Inject } from '@nestjs/common';
import { ClientSession, Connection, ObjectId } from 'mongoose';
import { InjectConnection } from '@nestjs/mongoose';

import { BoardRespositoryInterface } from '../../domain/repository/board.repository.interface';
import { BoardServiceInterface } from '../../domain/service/board.service.interface';
import { BoardRequest } from '../dto/HTTP-REQUEST/board.request';
import { BoardMapperServiceInterface } from '../../domain/service/mapper/board.service.mapper.inteface';
import {
  BoardGetAllResponse,
  BoardResponse,
} from '../dto/HTTP-RESPONSE/board.response';
import { UserServiceInterface } from 'src/contexts/user/domain/service/user.service.interface';
import { UpdateBoardDto } from '../dto/HTTP-REQUEST/board.update';
import { MyLoggerService } from 'src/contexts/shared/logger/logger.service';

export class BoardService implements BoardServiceInterface {
  constructor(
    @Inject('BoardRepositoryInterface')
    private readonly boardRepository: BoardRespositoryInterface,
    @Inject('BoardMapperServiceInterface')
    private readonly boardMapper: BoardMapperServiceInterface,
    @Inject('UserServiceInterface')
    private readonly userService: UserServiceInterface,
    @InjectConnection() private readonly connection: Connection,
    private readonly logger: MyLoggerService,
  ) {}
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
    board: UpdateBoardDto,
  ): Promise<BoardResponse> {
    try {
      this.logger.log('Updating board with ID: ' + id);
      return await this.boardRepository.updateBoardById(id, board);
    } catch (error: any) {
      this.logger.error(
        'An error was ocurred while trying to update board: ' + id,
      );
      throw error;
    }
  }
  async save(boardRequest: BoardRequest): Promise<BoardResponse> {
    const session: ClientSession = await this.connection.startSession();
    this.logger.log('Saving new board for the user id: ' + boardRequest.user);
    try {
      session.startTransaction();
      const boardMapper = this.boardMapper.requestToEntitiy(boardRequest);
      const boardSaved = await this.boardRepository.save(boardMapper, {
        session,
      });

      await this.userService.saveBoard(
        boardSaved.getId as ObjectId,
        boardSaved.getUser as ObjectId,
        { session },
      );

      await session.commitTransaction();

      return this.boardMapper.entityToResponse(boardSaved);
    } catch (error) {
      await session.abortTransaction();
      this.logger.error(
        'An error was ocurred while trying to save board: ' + boardRequest.user,
      );
      throw new Error(
        `Error al guardar el board y actualizar el user: ${error.message}`,
      );
    } finally {
      await session.endSession();
    }
  }
}
