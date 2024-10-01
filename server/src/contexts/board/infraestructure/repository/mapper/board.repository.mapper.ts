import { BoardResponse } from 'src/contexts/board/application/dto/HTTP-RESPONSE/board.response';
import { Board } from 'src/contexts/board/domain/entity/board.entity';
import { BoardRepositoryMapperInterface } from 'src/contexts/board/domain/repository/mapper/board.repository.mapper';

export class BoardRepositoryMapper implements BoardRepositoryMapperInterface {
  toResponse(board: any): BoardResponse {
    const boardResponse: BoardResponse = {
      _id: board._id,
      annotations: board.annotations,
      visibility: board.visibility,
      user: board.user,
      color: board.color,
      keywords: board.keywords,
    };
    return boardResponse;
  }
  toDomain(document: any): Board {
    return new Board(
      document.annotations,
      document.visibility,
      document.user,
      document.color,
      document.keywords,
      document._id,
    );
  }
}
