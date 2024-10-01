import { BoardRequest } from '../dto/HTTP-REQUEST/board.request';
import { UpdateBoardDto } from '../dto/HTTP-REQUEST/board.update';
import { BoardResponse } from '../dto/HTTP-RESPONSE/board.response';

export interface BoardAdapterInterface {
  save(board: BoardRequest): Promise<BoardResponse>;
  updateBoardById(id: string, board: UpdateBoardDto): Promise<BoardResponse>;
}
