import { Inject } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Connection, Model } from 'mongoose';

import { MyLoggerService } from 'src/contexts/shared/logger/logger.service';
import { BoardRespositoryInterface } from '../../domain/repository/board.repository.interface';
import { BoardDocument } from '../schemas/board.schema';
import { Board } from '../../domain/entity/board.entity';
import { BoardRepositoryMapperInterface } from '../../domain/repository/mapper/board.repository.mapper';
import { UpdateBoardDto } from '../../application/dto/HTTP-REQUEST/board.update';
import {
  BoardGetAllResponse,
  BoardResponse,
} from '../../application/dto/HTTP-RESPONSE/board.response';
import { IUser } from 'src/contexts/user/infrastructure/schemas/user.schema';

export class BoardRepository implements BoardRespositoryInterface {
  constructor(
    @InjectModel('Board')
    private readonly boardModel: Model<BoardDocument>,
    @Inject('BoardRepositoryMapperInterface')
    private readonly boardMapper: BoardRepositoryMapperInterface,
    @InjectModel('User')
    private readonly userModel: Model<IUser>,
    @InjectConnection() private readonly connection: Connection,
    private readonly logger: MyLoggerService,
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
            { searchTerm: { $regex: regex } },
          ],
          //$and: [{ visibility: 'public' }],
        })
        .populate({
          path: 'user',
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

  async save(board: Board): Promise<Board> {
    const session = await this.connection.startSession();
    session.startTransaction();
    try {
      const newBoard = new this.boardModel(board);
      const boardSaved = await newBoard.save({ session });
      await this.userModel.updateOne(
        { _id: board.getUser },
        { $set: { board: boardSaved._id } },
        { session },
      );
      await session.commitTransaction();
      return this.boardMapper.toDomain(boardSaved);
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }
}
