import { Board } from 'src/contexts/board/domain/entity/board.entity';
import { BoardMapperServiceInterface } from 'src/contexts/board/domain/service/mapper/board.service.mapper.inteface';
import { BoardRequest } from '../../dto/HTTP-REQUEST/board.request';
import { BoardResponse } from '../../dto/HTTP-RESPONSE/board.response';

export class BoardServiceMapper implements BoardMapperServiceInterface {
  requestToEntitiy(boardRequest: BoardRequest): Board {
    if (!boardRequest.user) {
      throw new Error('user is required');
    }
    return new Board(
      boardRequest.annotations,
      boardRequest.visibility,
      boardRequest.user,
      boardRequest.color,
      boardRequest.keywords,
    );
  }
  entityToResponse(board: Board): BoardResponse {
    const boardresponse: BoardResponse = {
      _id: board.getId ?? '',
      annotations: board.getAnnotations,
      visibility: board.getVisibility,
      user: board.getUser,
      color: board.getColor,
      keywords: board.getkeywords,
    };
    return boardresponse;
  }
}
