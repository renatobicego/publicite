import { Body, Controller, Inject, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { BoardAdapterInterface } from '../../application/adapter/board.adapter.interface';
import { BoardResponse } from '../../application/dto/HTTP-RESPONSE/board.response';
import { BoardRequest } from '../../application/dto/HTTP-REQUEST/board.request';

@ApiTags('Board')
@Controller('board')
export class BoardController {
  constructor(
    @Inject('BoardAdapterInterface')
    private readonly boardAdapter: BoardAdapterInterface,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a board' })
  @ApiResponse({
    status: 201,
    description: 'The board has been successfully created.',
    // type: [],
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error.',
  })
  //@ApiBody({ type: PostRequestDto })
  async createBoard(
    @Body() boardRequest: BoardRequest,
  ): Promise<BoardResponse> {
    try {
      return await this.boardAdapter.save(boardRequest);
    } catch (error: any) {
      throw error;
    }
  }
}
