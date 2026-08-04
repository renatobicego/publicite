import { Inject, Injectable } from '@nestjs/common';

import { ValuacionAdapterInterface } from '../../application/adapter/valuacion.adapter.interface';
import { ValuacionServiceInterface } from '../../domain/service/valuacion.service.interface';
import {
  StartValuacionRequest,
  ValuacionMessageRequest,
} from '../../application/dto/HTTP-REQUEST/valuacion.requests';
import {
  ValuacionListResponse,
  ValuacionMessageResponse,
  ValuacionResponse,
  ValuacionToPostDraftResponse,
} from '../../application/dto/HTTP-RESPONSE/valuacion.response';

@Injectable()
export class ValuacionAdapter implements ValuacionAdapterInterface {
  constructor(
    @Inject('ValuacionServiceInterface')
    private readonly valuacionService: ValuacionServiceInterface,
  ) {}

  startValuacion(
    userId: string,
    request: StartValuacionRequest,
  ): Promise<ValuacionMessageResponse> {
    return this.valuacionService.startValuacion(userId, request);
  }

  sendMessage(
    userId: string,
    request: ValuacionMessageRequest,
  ): Promise<ValuacionMessageResponse> {
    return this.valuacionService.sendMessage(userId, request);
  }

  skipBriefQuestion(
    userId: string,
    valuacionId: string,
  ): Promise<ValuacionMessageResponse> {
    return this.valuacionService.skipBriefQuestion(userId, valuacionId);
  }

  generateResult(
    userId: string,
    valuacionId: string,
  ): Promise<ValuacionResponse> {
    return this.valuacionService.generateResult(userId, valuacionId);
  }

  saveResult(userId: string, valuacionId: string): Promise<ValuacionResponse> {
    return this.valuacionService.saveResult(userId, valuacionId);
  }

  restoreToBoard(
    userId: string,
    valuacionId: string,
  ): Promise<ValuacionResponse> {
    return this.valuacionService.restoreToBoard(userId, valuacionId);
  }

  linkToPost(
    userId: string,
    valuacionId: string,
    postId: string,
  ): Promise<ValuacionResponse> {
    return this.valuacionService.linkToPost(userId, valuacionId, postId);
  }

  deleteValuacion(userId: string, valuacionId: string): Promise<boolean> {
    return this.valuacionService.deleteValuacion(userId, valuacionId);
  }

  getUserValuaciones(
    userId: string,
    limit: number,
    page: number,
  ): Promise<ValuacionListResponse> {
    return this.valuacionService.getUserValuaciones(userId, limit, page);
  }

  getValuacion(userId: string, valuacionId: string): Promise<ValuacionResponse> {
    return this.valuacionService.getValuacion(userId, valuacionId);
  }

  getValuacionByPost(postId: string): Promise<ValuacionResponse | null> {
    return this.valuacionService.getValuacionByPost(postId);
  }

  buildPostDraft(
    userId: string,
    valuacionId: string,
  ): Promise<ValuacionToPostDraftResponse> {
    return this.valuacionService.buildPostDraft(userId, valuacionId);
  }
}
