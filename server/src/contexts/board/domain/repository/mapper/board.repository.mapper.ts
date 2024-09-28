import { Board } from '../../entity/board.entity';

export interface BoardRepositoryMapperInterface {
  toDomain(board: any): Board;
}
