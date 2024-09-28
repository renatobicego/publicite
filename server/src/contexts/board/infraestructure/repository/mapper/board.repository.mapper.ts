import { Board } from 'src/contexts/board/domain/entity/board.entity';
import { BoardRepositoryMapperInterface } from 'src/contexts/board/domain/repository/mapper/board.repository.mapper';

export class BoardRepositoryMapper implements BoardRepositoryMapperInterface {
  toDomain(document: any): Board {
    return new Board(
      document.annotations,
      document.visibility,
      document.user,
      document.color,
      document._id,
    );
  }
}
