import { Body, Controller, Inject, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { ClerkAuthGuard } from 'src/contexts/shared/auth/clerk-auth/clerk.auth.guard';
import { BoardAdapterInterface } from '../../application/adapter/board.adapter.interface';
import { BoardResponse } from '../../application/dto/HTTP-RESPONSE/board.response';
import { BoardRequest } from '../../application/dto/HTTP-REQUEST/board.request';
import { BoardRequest_swagger } from './swagger/board.request.swagger';
import { BoardResponse_swagger } from './swagger/board.response.swagger';
import { PubliciteAuth } from 'src/contexts/shared/auth/publicite_auth/publicite_auth';
import { Context } from '@nestjs/graphql';

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
    type: [BoardResponse_swagger],
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error.',
  })
  @ApiBody({ type: BoardRequest_swagger })
  @UseGuards(ClerkAuthGuard)
  async createBoard(
    @Body() boardRequest: BoardRequest,
    @Req() request: Request,
  ): Promise<BoardResponse> {
    try {
      PubliciteAuth.authorize(request, boardRequest.user, 'http');
      const result = await this.boardAdapter.save(boardRequest);
      console.log(result);
      return result;
    } catch (error: any) {
      throw error;
    }
  }
}
