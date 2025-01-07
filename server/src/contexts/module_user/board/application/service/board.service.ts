import { Inject } from '@nestjs/common';


import { BoardRespositoryInterface } from '../../domain/repository/board.repository.interface';
import { BoardServiceInterface } from '../../domain/service/board.service.interface';
import { BoardRequest } from '../dto/HTTP-REQUEST/board.request';
import { BoardMapperServiceInterface } from '../../domain/service/mapper/board.service.mapper.inteface';
import {
  BoardGetAllResponse,
  BoardResponse,
} from '../dto/HTTP-RESPONSE/board.response';
import { UpdateBoardDto } from '../dto/HTTP-REQUEST/board.update';
import { MyLoggerService } from 'src/contexts/module_shared/logger/logger.service';
import { UserServiceInterface } from 'src/contexts/module_user/user/domain/service/user.service.interface';
import { makeUserRelationMap } from 'src/contexts/module_shared/utils/functions/makeUserRelationMap';

export class BoardService implements BoardServiceInterface {
  constructor(
    @Inject('BoardRepositoryInterface')
    private readonly boardRepository: BoardRespositoryInterface,
    @Inject('BoardMapperServiceInterface')
    private readonly boardMapper: BoardMapperServiceInterface,
    @Inject('UserServiceInterface')
    private readonly userService: UserServiceInterface,
    private readonly logger: MyLoggerService,
  ) { }
  async getBoardByAnnotationOrKeyword(
    board: string,
    limit: number,
    page: number,
    userRequestId: string,
    isUserRegister: boolean
  ): Promise<BoardGetAllResponse> {
    try {
      let relationMap: Map<string, String[]> = new Map<string, String[]>();
      this.logger.log('Getting board by annotation or keyword: ' + board);
      let conditions;
      userRequestId = "67164bd032f3b18ed706efb4"
      isUserRegister = true;
      if (userRequestId != null && isUserRegister) {
        const userRelation = await this.userService.getRelationsFromUserByUserId(
          userRequestId)
        relationMap = makeUserRelationMap(userRelation, userRequestId)
      }

      if (relationMap.size === 0 && isUserRegister) {
        conditions = [{ visibility: 'public' }, { visibility: 'registered' }]
      }

      if (relationMap.size > 0) {
        conditions = Array.from(relationMap.entries()).map(([key, value]) => ({
          user: key,
          visibility: { $in: value },
        }));
      }
      if (!isUserRegister) conditions = [{ visibility: 'public' }];

      return await this.boardRepository.getBoardByAnnotationOrKeyword(
        board,
        limit,
        page,
        conditions,
      );
    } catch (error: any) {
      throw error;
    }
  }
  async updateBoardById(
    id: string,
    owner: string,
    board: UpdateBoardDto,
  ): Promise<BoardResponse | null> {
    try {
      this.logger.log('Updating board with ID: ' + id);
      return await this.boardRepository.updateBoardById(id, owner, board);
    } catch (error: any) {
      this.logger.error(
        'An error was ocurred while trying to update board: ' + id,
      );
      throw error;
    }
  }
  async save(boardRequest: BoardRequest): Promise<BoardResponse> {
    try {
      this.logger.log('Saving new board for the user id: ' + boardRequest.user);
      const boardMapper = this.boardMapper.requestToEntitiy(boardRequest);
      const boardSaved = await this.boardRepository.save(boardMapper);
      return this.boardMapper.entityToResponse(boardSaved);
    } catch (error: any) {
      this.logger.error('An error was ocurred while trying to save board.');
      throw error;
    }

  }
}
