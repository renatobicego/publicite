import { BoardRequest } from '../dto/HTTP-REQUEST/board.request';
import { UpdateBoardDto } from '../dto/HTTP-REQUEST/board.update';
import { BoardGetAllResponse } from '../dto/HTTP-RESPONSE/board.getAll.response';
import { BoardResponse } from '../dto/HTTP-RESPONSE/board.response';

export interface BoardAdapterInterface {
  save(board: BoardRequest): Promise<BoardResponse>;
  getBoardByAnnotationOrKeyword(
    board: string,
    limit: number,
    page: number,
  ): Promise<BoardGetAllResponse>;
  updateBoardById(id: string, board: UpdateBoardDto): Promise<BoardResponse>;
}
