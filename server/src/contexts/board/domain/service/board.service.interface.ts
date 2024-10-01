import { BoardRequest } from '../../application/dto/HTTP-REQUEST/board.request';
import { UpdateBoardDto } from '../../application/dto/HTTP-REQUEST/board.update';
import { BoardResponse } from '../../application/dto/HTTP-RESPONSE/board.response';

export interface BoardServiceInterface {
  save(board: BoardRequest): Promise<BoardResponse>;
  updateBoardById(id: string, board: UpdateBoardDto): Promise<BoardResponse>;
}
