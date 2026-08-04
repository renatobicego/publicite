import { MatchResponse, SearchMatchRequest } from '../../application/dto/match.dto';

export interface MatchServiceInterface {
  /**
   * Busca anuncios similares al input del usuario. Stateless: no persiste nada,
   * el "guardar match" del panel derecho es estado del front sobre postIds.
   *
   * @param userId mongoId si está logueado; undefined para anónimos (que sólo
   *               consumen de la cuota diaria comunitaria).
   */
  searchMatch(
    userId: string | undefined,
    request: SearchMatchRequest,
  ): Promise<MatchResponse>;
}
