import { Inject } from '@nestjs/common';
import { BoardRespositoryInterface } from '../../domain/repository/board.repository.interface';
import { BoardServiceInterface } from '../../domain/service/board.service.interface';
import { BoardRequest } from '../dto/HTTP-REQUEST/board.request';
import { BoardMapperServiceInterface } from '../../domain/service/mapper/board.service.mapper.inteface';
import { BoardResponse } from '../dto/HTTP-RESPONSE/board.response';
import { UserServiceInterface } from 'src/contexts/user/domain/service/user.service.interface';
import { InjectConnection } from '@nestjs/mongoose';
import { ClientSession, Connection, ObjectId } from 'mongoose';

export class BoardService implements BoardServiceInterface {
  constructor(
    @Inject('BoardRepositoryInterface')
    private readonly boardRepository: BoardRespositoryInterface,
    @Inject('BoardMapperServiceInterface')
    private readonly boardMapper: BoardMapperServiceInterface,
    @Inject('UserServiceInterface')
    private readonly userService: UserServiceInterface,
    @InjectConnection() private readonly connection: Connection,
  ) {}
  async save(boardRequest: BoardRequest): Promise<BoardResponse> {
    const session: ClientSession = await this.connection.startSession();

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
      throw new Error(
        `Error al guardar el board y actualizar el user: ${error.message}`,
      );
    } finally {
      await session.endSession();
    }
  }
}
