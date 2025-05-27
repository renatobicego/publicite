import { Board } from 'src/contexts/module_user/board/domain/entity/board.entity';
import { BoardMapperServiceInterface } from 'src/contexts/module_user/board/domain/service/mapper/board.service.mapper.inteface';
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
      boardRequest.searchTerm,
    );
  }
  entityToResponse(board: Board): BoardResponse {
    const boardresponse: BoardResponse = {
      _id: board.getId ?? undefined,
      annotations: board.getAnnotations,
      visibility: board.getVisibility,
      user: board.getUser as any,
      color: board.getColor,
      keywords: board.getkeywords,
    };
    return boardresponse;
  }
}

