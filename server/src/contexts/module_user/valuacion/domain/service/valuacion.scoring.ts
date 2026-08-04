import {
  ValuacionBriefField,
  VALUACION_BRIEF_FIELDS,
} from '../entity/enum/valuacion.enums';
import {
  DescriptiveAnalysis,
  PhotoAnalysis,
} from '../entity/valuacion.entity';

/**
 * Rúbrica de completitud y capas.
 *
 * El requerimiento pide que el sticker sea "de formato fijo e inmodificable,
 * igual para todas las valuaciones, de manera que los resultados puedan
 * compararse entre sí". Por eso la capa y el % de completitud se calculan acá,
 * de forma determinística, y NO los decide el modelo: dos valuaciones con la
 * misma información tienen que dar siempre la misma capa.
 *
 * La IA sólo aporta los scores (1-5) y los valores estimados.
 */

/** Peso de las respuestas del brief sobre el total de completitud. */
const BRIEF_WEIGHT = 70;
/** Peso de las imágenes aportadas sobre el total de completitud. */
const IMAGES_WEIGHT = 30;
/** A partir de esta cantidad de imágenes no se suma más completitud. */
const IMAGES_FOR_FULL_SCORE = 3;

/** Techo de confianza por capa (AC08: menos info ⇒ menos confianza). */
const CONFIDENCE_CAP_BY_LAYER: Record<number, number> = {
  1: 45,
  2: 75,
  3: 100,
};

export interface ValuacionCompletion {
  completionPercent: number;
  layer: 1 | 2 | 3;
}

/**
 * Completitud = respuestas del brief (70%) + imágenes aportadas (30%).
 * Capa 1: 0-33% · Capa 2: 34-66% · Capa 3: 67-100%.
 */
export function computeCompletion(
  coveredFields: ValuacionBriefField[],
  imagesCount: number,
): ValuacionCompletion {
  const uniqueFields = new Set(
    (coveredFields ?? []).filter((field) =>
      VALUACION_BRIEF_FIELDS.includes(field),
    ),
  );

  const briefScore =
    (uniqueFields.size / VALUACION_BRIEF_FIELDS.length) * BRIEF_WEIGHT;

  const imagesScore =
    (Math.min(Math.max(imagesCount, 0), IMAGES_FOR_FULL_SCORE) /
      IMAGES_FOR_FULL_SCORE) *
    IMAGES_WEIGHT;

  const completionPercent = Math.round(briefScore + imagesScore);

  return {
    completionPercent,
    layer: layerForCompletion(completionPercent),
  };
}

export function layerForCompletion(completionPercent: number): 1 | 2 | 3 {
  if (completionPercent <= 33) return 1;
  if (completionPercent <= 66) return 2;
  return 3;
}

/**
 * Acota la confianza que declaró la IA al techo de su capa. Sin esto el modelo
 * puede devolver 95% de confianza sobre una sola foto sin descripción, que es
 * justo lo que el sistema de capas existe para evitar.
 */
export function capConfidenceByLayer(
  aiConfidence: number | undefined,
  layer: 1 | 2 | 3,
): number {
  const cap = CONFIDENCE_CAP_BY_LAYER[layer] ?? 100;
  const raw = Number.isFinite(aiConfidence as number) ? (aiConfidence as number) : 0;
  return Math.max(0, Math.min(Math.round(raw), cap));
}

/**
 * Puntuación final del Círculo de Valoración: promedio de los 8 ejes
 * (4 fotográficos + 4 descriptivos). Se ignoran los ejes ausentes para que una
 * valuación sin fotos no quede penalizada con ceros.
 */
export function computeFinalScore(
  photoAnalysis: PhotoAnalysis | null | undefined,
  descriptiveAnalysis: DescriptiveAnalysis | null | undefined,
): number | null {
  const scores: number[] = [];

  const photoScores = photoAnalysis?.scores;
  if (photoScores) {
    scores.push(
      photoScores.estado,
      photoScores.marca,
      photoScores.mercado,
      photoScores.rareza,
    );
  }

  const descriptiveScores = descriptiveAnalysis?.scores;
  if (descriptiveScores) {
    scores.push(
      descriptiveScores.uso,
      descriptiveScores.vidaUtil,
      descriptiveScores.mantenimiento,
      descriptiveScores.documentacion,
    );
  }

  const valid = scores.filter(
    (score) => Number.isFinite(score) && score >= 1 && score <= 5,
  );
  if (valid.length === 0) return null;

  const average = valid.reduce((total, score) => total + score, 0) / valid.length;
  return Math.round(average * 100) / 100;
}

/**
 * Normaliza un score de la IA al rango 1-5, o null si no vino nada usable.
 *
 * Ojo con null/''/[]: Number() los convierte a 0, que es finito. Sin este
 * chequeo previo, un score ausente terminaría clavado en 1 estrella
 * ("deficiente") en el sticker en lugar de quedar marcado como sin dato.
 */
export function normalizeScore(value: any): number | null {
  if (value === null || value === undefined || value === '') return null;
  if (typeof value !== 'number' && typeof value !== 'string') return null;

  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return null;
  return Math.max(1, Math.min(5, Math.round(parsed)));
}
