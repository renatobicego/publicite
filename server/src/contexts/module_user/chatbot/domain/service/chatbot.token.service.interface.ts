import {
  ChatbotTokenStatusResponse,
  ChatbotUsageReportResponse,
} from '../../application/dto/HTTP-RESPONSE/chatbot.token.response';
import {
  AiUsage,
  AiUsageKind,
  TokenGateResult,
  UsageMeta,
} from '../entity/chatbot.token.types';

export interface ChatbotTokenServiceInterface {
  /**
   * Resuelve quién consume (plan / free / anónimo) y si tiene saldo para una
   * request de IA. También dispara, si corresponde, la acreditación mensual
   * de la bolsa comunitaria.
   *
   * @param userId mongoId confiable si vino de token de Clerk; puede ser un
   *               identificador anónimo (uuid, whatsapp:<tel>) o undefined.
   * @param sessionId sessionId del chat, usado como identidad anónima de fallback.
   */
  resolveAndCheck(
    userId: string | undefined,
    sessionId: string | undefined,
  ): Promise<TokenGateResult>;

  /**
   * Descuenta el usage de la cuota correspondiente y lo registra para tracking.
   * El descuento se pondera por el costo relativo del modelo usado (gpt-4o vale
   * ~10 tokens de gpt-4o-mini), así que lo cobrado no coincide con los tokens
   * informados por OpenAI.
   *
   * @returns tokens reales efectivamente cobrados (ya ponderados). Devuelve el
   *          valor calculado aunque falle la persistencia del log.
   */
  recordUsage(
    gate: TokenGateResult,
    usage: AiUsage,
    meta: UsageMeta,
  ): Promise<number>;

  /**
   * Cobra el usage y devuelve el estado de tokens ya actualizado, para poder
   * informarlo al front en la misma respuesta. Es el camino que deben usar
   * todos los servicios de IA (chat, imagen, valuación, match) en lugar de
   * llamar a recordUsage() y recalcular el estado por su cuenta.
   *
   * El canal se infiere del sessionId ('whatsapp:' → whatsapp, resto → web).
   */
  chargeAndBuildStatus(
    gate: TokenGateResult,
    usage: AiUsage | undefined,
    meta: { sessionId?: string; kind: AiUsageKind; model: string },
  ): Promise<ChatbotTokenStatusResponse>;

  /** Estado de tokens para mostrar en el perfil del usuario logueado. */
  getStatusForUser(userId: string): Promise<ChatbotTokenStatusResponse>;

  /** Estado (en tokens Publicité) derivado de un gate ya resuelto. */
  buildStatusFromGate(gate: TokenGateResult): ChatbotTokenStatusResponse;

  /** Mensaje en español para responder cuando el gate bloqueó la request. */
  buildLimitMessage(gate: TokenGateResult): string;

  /**
   * Reporte de consumo por usuario + estado de la bolsa comunitaria.
   * @param chargedTo filtra por 'community' | 'plan'; undefined = todo.
   */
  getUsageReport(
    chargedTo: string | undefined,
    limit: number,
  ): Promise<ChatbotUsageReportResponse>;
}
