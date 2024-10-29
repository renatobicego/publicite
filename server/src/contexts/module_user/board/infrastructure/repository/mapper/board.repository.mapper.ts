import { BoardResponse } from '../../../application/dto/HTTP-RESPONSE/board.response';
import { Board } from '../../../domain/entity/board.entity';
import { BoardRepositoryMapperInterface } from '../../../domain/repository/mapper/board.repository.mapper';

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
      document.searchTerm,
      document._id,
    );
  }
}
