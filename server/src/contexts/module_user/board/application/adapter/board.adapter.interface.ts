import { BoardRequest } from '../dto/HTTP-REQUEST/board.request';
import { UpdateBoardDto } from '../dto/HTTP-REQUEST/board.update';
import { BoardGetAllResponse, BoardResponse } from '../dto/HTTP-RESPONSE/board.response';

export interface BoardAdapterInterface {
  save(board: BoardRequest): Promise<any>;
  getBoardByAnnotationOrKeyword(
    board: string,
    limit: number,
    page: number,
  ): Promise<BoardGetAllResponse>;
  updateBoardById(id: string, owner: string, board: UpdateBoardDto): Promise<BoardResponse>;
}
