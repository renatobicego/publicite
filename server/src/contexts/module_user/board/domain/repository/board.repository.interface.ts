import { ClientSession } from 'mongoose';
import { Board } from '../entity/board.entity';
import { UpdateBoardDto } from '../../application/dto/HTTP-REQUEST/board.update';
import {
  BoardGetAllResponse,
  BoardResponse,
} from '../../application/dto/HTTP-RESPONSE/board.response';

export interface BoardRespositoryInterface {
  getBoardByAnnotationOrKeyword(
    board: string,
    limit: number,
    page: number,
  ): Promise<BoardGetAllResponse>;
  save(board: Board): Promise<Board>;
  updateBoardById(id: string, owner: string, board: UpdateBoardDto): Promise<BoardResponse>;
}
