import { Body, Controller, Inject, Post, UseGuards } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { ClerkAuthGuard } from 'src/contexts/module_shared/auth/clerk-auth/clerk.auth.guard';
import { BoardAdapterInterface } from '../../application/adapter/board.adapter.interface';
import { BoardResponse } from '../../application/dto/HTTP-RESPONSE/board.response';
import { BoardRequest } from '../../application/dto/HTTP-REQUEST/board.request';
import { BoardRequest_swagger } from './swagger/board.request.swagger';
import { BoardResponse_swagger } from './swagger/board.response.swagger';
import { PubliciteAuth } from 'src/contexts/module_shared/auth/publicite_auth/publicite_auth';
import { Context } from '@nestjs/graphql';
import { CustomContextRequestInterface } from 'src/contexts/module_shared/auth/custom_request/custom.context.request.interface';

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
  //@UseGuards(ClerkAuthGuard)
  async createBoard(
    @Body() boardRequest: BoardRequest,
    @Context() context: { req: CustomContextRequestInterface },
  ): Promise<BoardResponse> {
    try {
      //const userRequestId = context.req.userRequestId;
      if (!boardRequest.user) throw Error('User is required');
      //PubliciteAuth.authorize(userRequestId, boardRequest.user);
      const result = await this.boardAdapter.save(boardRequest);
      return result;
    } catch (error: any) {
      throw error;
    }
  }
}
