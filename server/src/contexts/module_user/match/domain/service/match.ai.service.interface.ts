import { AiUsage } from 'src/contexts/module_user/chatbot/domain/entity/chatbot.token.types';
import { MatchCandidate } from 'src/contexts/module_post/post/domain/repository/post.repository.interface';

export interface MatchCriteriaResult {
  keywords: string[];
  categories: string[];
  priceMin: number | null;
  priceMax: number | null;
  postType: string | null;
  description: string;
  usage?: AiUsage;
  model: string;
}

export interface RankedMatch {
  postId: string;
  relevanceScore: number;
  matchReason: string;
}

export interface MatchRankingResult {
  matches: RankedMatch[];
  usage?: AiUsage;
  model: string;
}

export interface MatchAIServiceInterface {
  /** Paso 1: traduce el input del usuario a criterios de búsqueda. */
  extractCriteria(params: {
    text?: string;
    imageUrls: string[];
    modeContext?: string;
  }): Promise<MatchCriteriaResult>;

  /** Paso 2: rankea los candidatos de Mongo y explica cada coincidencia. */
  rankMatches(params: {
    interpretation: string;
    candidates: MatchCandidate[];
    imageUrls: string[];
  }): Promise<MatchRankingResult>;
}
