import { Inject } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ClientSession, Model } from 'mongoose';

import { BoardRespositoryInterface } from '../../domain/repository/board.repository.interface';
import { BoardDocument } from '../schemas/board.schema';
import { Board } from '../../domain/entity/board.entity';
import { BoardRepositoryMapperInterface } from '../../domain/repository/mapper/board.repository.mapper';

export class BoardRepository implements BoardRespositoryInterface {
  constructor(
    @InjectModel('Board')
    private readonly boardModel: Model<BoardDocument>,
    @Inject('BoardRepositoryMapperInterface')
    private readonly boardMapper: BoardRepositoryMapperInterface,
  ) {}
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
