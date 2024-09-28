import { BoardRequest } from '../dto/HTTP-REQUEST/board.request';
import { BoardResponse } from '../dto/HTTP-RESPONSE/board.response';

export interface BoardAdapterInterface {
  save(board: BoardRequest): Promise<BoardResponse>;
}
