import { BoardRequest } from '../../application/dto/HTTP-REQUEST/board.request';
import { BoardResponse } from '../../application/dto/HTTP-RESPONSE/board.response';

export interface BoardServiceInterface {
  save(board: BoardRequest): Promise<BoardResponse>;
}
