import {
  ValuacionListResponse,
  ValuacionMessageResponse,
  ValuacionResponse,
  ValuacionToPostDraftResponse,
} from '../../application/dto/HTTP-RESPONSE/valuacion.response';
import { StartValuacionRequest, ValuacionMessageRequest } from '../../application/dto/HTTP-REQUEST/valuacion.requests';

export interface ValuacionServiceInterface {
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

  /** Acepta el resultado y lo manda al panel derecho. */
  saveResult(userId: string, valuacionId: string): Promise<ValuacionResponse>;

  /** Devuelve un resultado guardado al tablero central para seguir editándolo. */
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
