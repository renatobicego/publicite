import { BoardResponse } from 'src/contexts/board/application/dto/HTTP-RESPONSE/board.response';
import { Board } from '../../entity/board.entity';

export interface BoardRepositoryMapperInterface {
  toDomain(board: any): Board;
  toResponse(board: any): BoardResponse;
}
