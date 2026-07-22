import {
  ChatbotTokenStatusResponse,
  ChatbotUsageReportResponse,
} from '../../application/dto/HTTP-RESPONSE/chatbot.token.response';
import {
  AiUsage,
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

  /** Descuenta el usage real de la cuota correspondiente y lo registra para tracking. */
  recordUsage(
    gate: TokenGateResult,
    usage: AiUsage,
    meta: UsageMeta,
  ): Promise<void>;

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
