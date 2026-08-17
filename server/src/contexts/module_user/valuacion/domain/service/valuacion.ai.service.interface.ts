import { AiUsage } from 'src/contexts/module_user/chatbot/domain/entity/chatbot.token.types';
import { ValuacionCategory } from '../entity/enum/valuacion.enums';
import {
  DescriptiveAnalysis,
  EstimatedValues,
  PhotoAnalysis,
  ValuacionBriefMessage,
  ValuacionDataSourceEntry,
} from '../entity/valuacion.entity';

export interface BriefTurnResult {
  reply: string;
  coveredFields: string[];
  /** Ejes que la IA descartó por no aplicar al ítem (no se preguntan más). */
  notApplicableFields: string[];
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
  confidencePercent: number;
  dataSources: ValuacionDataSourceEntry[];
  usage?: AiUsage;
  model: string;
}

export interface ValuacionAIServiceInterface {
  /** Un turno del brief: devuelve la próxima pregunta y qué ejes quedaron cubiertos. */
  runBriefTurn(params: {
    category: ValuacionCategory;
    modeContext?: string;
    coveredFields: string[];
    notApplicableFields?: string[];
    history: ValuacionBriefMessage[];
    userMessage: string;
    imageUrls: string[];
  }): Promise<BriefTurnResult>;

  /** Genera el informe final a partir de todo el contexto acumulado. */
  generateResult(params: {
    category: ValuacionCategory;
    modeContext?: string;
    history: ValuacionBriefMessage[];
    imageUrls: string[];
    comparables?: ValuacionComparable[];
  }): Promise<ValuacionResultPayload>;
}
