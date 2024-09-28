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
      // Iniciar la transacción
      session.startTransaction();

      // 1. Convertir el request en la entidad board
      const boardMapper = this.boardMapper.requestToEntitiy(boardRequest);

      // 2. Guardar el board en la base de datos dentro de la transacción
      const boardSaved = await this.boardRepository.save(boardMapper, {
        session,
      });

      // 3. Actualizar el user con el nuevo board dentro de la transacción
      await this.userService.saveBoard(
        boardSaved.getId as ObjectId,
        boardSaved.getUser as ObjectId,
        { session },
      );

      // 4. Confirmar la transacción si ambas operaciones tuvieron éxito
      await session.commitTransaction();

      // 5. Devolver la respuesta mapeada
      return this.boardMapper.entityToResponse(boardSaved);
    } catch (error) {
      // Si ocurre un error, revertir los cambios
      await session.abortTransaction();
      throw new Error(
        `Error al guardar el board y actualizar el user: ${error.message}`,
      );
    } finally {
      // Asegurarse de que la sesión siempre se cierre
      await session.endSession();
    }
  }
}
