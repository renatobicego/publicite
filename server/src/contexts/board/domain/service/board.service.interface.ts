import { BoardRequest } from '../../application/dto/HTTP-REQUEST/board.request';
import { UpdateBoardDto } from '../../application/dto/HTTP-REQUEST/board.update';
import {
  BoardGetAllResponse,
  BoardResponse,
} from '../../application/dto/HTTP-RESPONSE/board.response';

export interface BoardServiceInterface {
  getBoardByAnnotationOrKeyword(
    board: string,
    limit: number,
    page: number,
  ): Promise<BoardGetAllResponse>;
  save(board: BoardRequest): Promise<BoardResponse>;
  updateBoardById(id: string, board: UpdateBoardDto): Promise<BoardResponse>;
}
