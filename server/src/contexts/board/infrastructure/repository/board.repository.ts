import { Inject } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ClientSession, Model } from 'mongoose';

import { BoardRespositoryInterface } from '../../domain/repository/board.repository.interface';
import { BoardDocument } from '../schemas/board.schema';
import { Board } from '../../domain/entity/board.entity';
import { BoardRepositoryMapperInterface } from '../../domain/repository/mapper/board.repository.mapper';
import { UpdateBoardDto } from '../../application/dto/HTTP-REQUEST/board.update';
import {
  BoardGetAllResponse,
  BoardResponse,
} from '../../application/dto/HTTP-RESPONSE/board.response';

export class BoardRepository implements BoardRespositoryInterface {
  constructor(
    @InjectModel('Board')
    private readonly boardModel: Model<BoardDocument>,
    @Inject('BoardRepositoryMapperInterface')
    private readonly boardMapper: BoardRepositoryMapperInterface,
  ) {}
  async getBoardByAnnotationOrKeyword(
    board: string,
    limit: number,
    page: number,
  ): Promise<BoardGetAllResponse> {
    try {
      const regex = new RegExp(`${board}`, 'i');
      const boards = await this.boardModel
        .find({
          $or: [
            { annotations: { $regex: regex } },
            { keywords: { $regex: regex } },
          ],
          //$and: [{ visibility: 'public' }],
        })
        .populate({
          path: 'user',
          match: {
            $or: [
              { username: { $regex: regex } },
              { name: { $regex: regex } },
              { lastName: { $regex: regex } },
              { businessName: { $regex: regex } },
            ],
          },
          select: '_id profilePhotoUrl name lastName businessName username',
        })
        .limit(limit + 1)
        .skip((page - 1) * limit)
        .lean();

      const hasMore = boards.length > limit;
      const boardsResponse = boards.slice(0, limit).map((board) => {
        return this.boardMapper.toResponse(board);
      });
      return {
        boards: boardsResponse,
        hasMore: hasMore,
      };
    } catch (error: any) {
      throw error;
    }
  }

  async updateBoardById(
    id: string,
    board: UpdateBoardDto,
  ): Promise<BoardResponse> {
    try {
      const boardUpdated = await this.boardModel.findByIdAndUpdate(id, board, {
        new: true,
      });
      return this.boardMapper.toResponse(boardUpdated);
    } catch (error: any) {
      throw error;
    }
  }
  async save(
    board: Board,
    options?: { session?: ClientSession },
  ): Promise<Board> {
    try {
      const newBoard = new this.boardModel(board);
      const boardSaved = await newBoard.save(options);
      return this.boardMapper.toDomain(boardSaved);
    } catch (error: any) {
      throw error;
    }
  }
}
