import { registerEnumType } from '@nestjs/graphql';

/** Qué se está valuando. Define el set de preguntas del brief. */
export enum ValuacionCategory {
  imagen = 'imagen',
  objeto = 'objeto',
  servicio = 'servicio',
  bien = 'bien',
  otro = 'otro',
}

registerEnumType(ValuacionCategory, {
  name: 'ValuacionCategory',
  description: 'Categoría de lo que se valúa (imagen, objeto, servicio, bien, otro)',
});

/**
 * Ciclo de vida de una valuación:
 *   draft      → brief en curso, todavía no hay resultado
 *   processing → generando el resultado con IA
 *   completed  → resultado generado, vive en el tablero central
 *   saved      → el usuario lo aceptó; pasa al panel derecho (AC04 Valuación)
 *   archived   → soft delete (AC06 Tablero: no se borra ni se devuelven tokens)
 */
export enum ValuacionStatus {
  draft = 'draft',
  processing = 'processing',
  completed = 'completed',
  saved = 'saved',
  archived = 'archived',
}

registerEnumType(ValuacionStatus, {
  name: 'ValuacionStatus',
  description: 'Estado de la valuación',
});

/** Origen de cada dato del informe (sección "Fuentes de Información"). */
export enum ValuacionDataSource {
  fotografica = 'fotografica',
  descriptiva = 'descriptiva',
  inferencia_ia = 'inferencia_ia',
}

registerEnumType(ValuacionDataSource, {
  name: 'ValuacionDataSource',
  description: 'Origen del dato: fotográfica, descriptiva o inferencia de la IA',
});

/**
 * Ejes del brief. Son fijos y son la base del cálculo de completitud y capa:
 * el sticker tiene que ser comparable entre valuaciones, así que la rúbrica no
 * puede depender de cuántas preguntas se le ocurrieron a la IA en cada sesión.
 */
export enum ValuacionBriefField {
  identificacion = 'identificacion',
  estado = 'estado',
  antiguedad = 'antiguedad',
  documentacion = 'documentacion',
  mantenimiento = 'mantenimiento',
  danos = 'danos',
  mercado = 'mercado',
  precioReferencia = 'precioReferencia',
}

registerEnumType(ValuacionBriefField, {
  name: 'ValuacionBriefField',
  description: 'Eje del brief de valuación',
});

export const VALUACION_BRIEF_FIELDS: ValuacionBriefField[] =
  Object.values(ValuacionBriefField);
