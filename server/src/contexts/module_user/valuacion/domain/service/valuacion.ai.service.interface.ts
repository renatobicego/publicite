import { AiUsage } from 'src/contexts/module_user/chatbot/domain/entity/chatbot.token.types';
import { ValuacionCategory } from '../entity/enum/valuacion.enums';
import {
  DescriptiveAnalysis,
  EstimatedValues,
  PhotoAnalysis,
  ValuacionBriefItem,
  ValuacionBriefMessage,
  ValuacionDataSourceEntry,
} from '../entity/valuacion.entity';

export interface BriefTurnResult {
  reply: string;
  /** Identificación corta de lo que se valúa (máx ~80 chars), o null si aún no se sabe. */
  title: string | null;
  /** Checklist dinámico completo y actualizado después de este turno. */
  briefItems: ValuacionBriefItem[];
  briefComplete: boolean;
  usage?: AiUsage;
  model: string;
}

/** Anuncio real de la plataforma usado como referencia de mercado en el informe. */
export interface ValuacionComparable {
  title: string;
  price: number;
  postType: string;
  categoryLabels: string[];
}

export interface ValuacionResultPayload {
  photoAnalysis: PhotoAnalysis | null;
  descriptiveAnalysis: DescriptiveAnalysis | null;
  estimatedValues: EstimatedValues | null;
  /** En qué se basó la IA para los valores (2-3 oraciones, se muestra al usuario). */
  pricingRationale: string | null;
  confidencePercent: number;
  dataSources: ValuacionDataSourceEntry[];
  usage?: AiUsage;
  model: string;
}

export interface ValuacionAIServiceInterface {
  /** Un turno del brief: devuelve la próxima pregunta y el checklist actualizado. */
  runBriefTurn(params: {
    category: ValuacionCategory;
    modeContext?: string;
    title: string | null;
    briefItems: ValuacionBriefItem[];
    history: ValuacionBriefMessage[];
    userMessage: string;
    imageUrls: string[];
  }): Promise<BriefTurnResult>;

  /** Genera el informe final a partir de todo el contexto acumulado. */
  generateResult(params: {
    category: ValuacionCategory;
    modeContext?: string;
    title: string | null;
    history: ValuacionBriefMessage[];
    imageUrls: string[];
    comparables?: ValuacionComparable[];
  }): Promise<ValuacionResultPayload>;
}
