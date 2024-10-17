import { ClientSession } from 'mongoose';
import { Board } from '../entity/board.entity';
import { UpdateBoardDto } from '../../application/dto/HTTP-REQUEST/board.update';
import { BoardResponse } from '../../application/dto/HTTP-RESPONSE/board.response';
import { BoardGetAllResponse } from '../../application/dto/HTTP-RESPONSE/board.getAll.response';

export interface BoardRespositoryInterface {
  getBoardByAnnotationOrKeyword(
    board: string,
    limit: number,
    page: number,
  ): Promise<BoardGetAllResponse>;
  save(board: Board, options?: { session?: ClientSession }): Promise<Board>;
  updateBoardById(id: string, board: UpdateBoardDto): Promise<BoardResponse>;
}
