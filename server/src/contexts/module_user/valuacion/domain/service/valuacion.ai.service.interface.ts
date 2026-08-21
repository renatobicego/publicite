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

/**
 * Resultado del análisis único de las fotos. Las notas se persisten en
 * images[].analysisNotes y de ahí en más reemplazan a la imagen: ni el brief ni
 * el informe vuelven a mandar los bytes a OpenAI.
 */
export interface ImageAnalysisResult {
  notes: { url: string; notes: string }[];
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
    /** Análisis ya hecho de cada foto, en texto. Las imágenes no se reenvían. */
    imageNotes: string[];
  }): Promise<BriefTurnResult>;

  /** Genera el informe final a partir de todo el contexto acumulado. */
  generateResult(params: {
    category: ValuacionCategory;
    modeContext?: string;
    title: string | null;
    history: ValuacionBriefMessage[];
    /** Análisis ya hecho de cada foto, en texto. Las imágenes no se reenvían. */
    imageNotes: string[];
    comparables?: ValuacionComparable[];
  }): Promise<ValuacionResultPayload>;

  /**
   * Mira las fotos y devuelve, por cada una, el texto que la va a representar
   * durante toda la valuación. Corre una sola vez por imagen: el llamador
   * persiste las notas y nunca vuelve a mandar los píxeles.
   */
  analyzeImages(params: {
    category: ValuacionCategory;
    title: string | null;
    imageUrls: string[];
  }): Promise<ImageAnalysisResult>;
}
