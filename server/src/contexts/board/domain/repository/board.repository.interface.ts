import { ClientSession } from 'mongoose';
import { Board } from '../entity/board.entity';
import { UpdateBoardDto } from '../../application/dto/HTTP-REQUEST/board.update';
import { BoardResponse } from '../../application/dto/HTTP-RESPONSE/board.response';

export interface BoardRespositoryInterface {
  save(board: Board, options?: { session?: ClientSession }): Promise<Board>;
  updateBoardById(id: string, board: UpdateBoardDto): Promise<BoardResponse>;
}
