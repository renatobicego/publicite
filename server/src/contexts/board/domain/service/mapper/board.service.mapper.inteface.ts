import { BoardRequest } from 'src/contexts/board/application/dto/HTTP-REQUEST/board.request';
import { BoardResponse } from 'src/contexts/board/application/dto/HTTP-RESPONSE/board.response';
import { Board } from '../../entity/board.entity';

export interface BoardMapperServiceInterface {
  requestToEntitiy(boardRequest: BoardRequest): Board;
  entityToResponse(board: Board): BoardResponse;
}
