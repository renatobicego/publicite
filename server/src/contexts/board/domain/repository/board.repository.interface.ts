import { ClientSession } from 'mongoose';
import { Board } from '../entity/board.entity';

export interface BoardRespositoryInterface {
  save(board: Board, options?: { session?: ClientSession }): Promise<Board>;
}
