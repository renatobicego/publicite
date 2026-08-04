import {
  StartValuacionRequest,
  ValuacionMessageRequest,
} from '../dto/HTTP-REQUEST/valuacion.requests';
import {
  ValuacionListResponse,
  ValuacionMessageResponse,
  ValuacionResponse,
  ValuacionToPostDraftResponse,
} from '../dto/HTTP-RESPONSE/valuacion.response';

export interface ValuacionAdapterInterface {
  startValuacion(
    userId: string,
    request: StartValuacionRequest,
  ): Promise<ValuacionMessageResponse>;
  sendMessage(
    userId: string,
    request: ValuacionMessageRequest,
  ): Promise<ValuacionMessageResponse>;
  skipBriefQuestion(
    userId: string,
    valuacionId: string,
  ): Promise<ValuacionMessageResponse>;
  generateResult(userId: string, valuacionId: string): Promise<ValuacionResponse>;
  saveResult(userId: string, valuacionId: string): Promise<ValuacionResponse>;
  restoreToBoard(userId: string, valuacionId: string): Promise<ValuacionResponse>;
  linkToPost(
    userId: string,
    valuacionId: string,
    postId: string,
  ): Promise<ValuacionResponse>;
  deleteValuacion(userId: string, valuacionId: string): Promise<boolean>;
  getUserValuaciones(
    userId: string,
    limit: number,
    page: number,
  ): Promise<ValuacionListResponse>;
  getValuacion(userId: string, valuacionId: string): Promise<ValuacionResponse>;
  getValuacionByPost(postId: string): Promise<ValuacionResponse | null>;
  buildPostDraft(
    userId: string,
    valuacionId: string,
  ): Promise<ValuacionToPostDraftResponse>;
}
