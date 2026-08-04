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
  briefComplete: boolean;
  usage?: AiUsage;
  model: string;
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
  }): Promise<ValuacionResultPayload>;
}
