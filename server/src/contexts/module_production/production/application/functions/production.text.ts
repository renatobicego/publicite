import { BadRequestException } from '@nestjs/common';

import { removeAccents_removeEmojisAndToLowerCase } from 'src/contexts/module_post/post/domain/utils/normalice.data';
import {
  checkStopWordsAndReturnSearchQuery,
  SearchType,
} from 'src/contexts/module_shared/utils/functions/checkStopWordsAndReturnSearchQuery';

/** Texto normalizado para buscar (mismo criterio que Anuncios). */
export function toSearchText(value: string | undefined | null): string {
  return removeAccents_removeEmojisAndToLowerCase(value ?? '');
}

const escapeRegex = (value: string) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * Regex de búsqueda de producciones (NAV-05). Reutiliza las stopwords de
 * Anuncios, pero escapa el término antes: el helper compartido arma la regex
 * con el texto del usuario tal cual. Devuelve null si no queda nada buscable.
 */
export function buildProductionSearchRegex(searchTerm?: string): string | null {
  if (!searchTerm) return null;
  return checkStopWordsAndReturnSearchQuery(
    escapeRegex(searchTerm),
    SearchType.post,
  );
}

const FILE_NAME_MAX_LENGTH = 80;

/**
 * ID `fileName` de un archivo o artículo (BLG-13): lo define el usuario, se
 * muestra y es único dentro de su contenedor.
 */
export function normalizeFileName(fileName: string): string {
  const normalized = (fileName ?? '').trim().replace(/\s+/g, ' ');
  if (!normalized) {
    throw new BadRequestException('El ID del archivo no puede estar vacío');
  }
  if (normalized.length > FILE_NAME_MAX_LENGTH) {
    throw new BadRequestException(
      `El ID del archivo no puede superar los ${FILE_NAME_MAX_LENGTH} caracteres`,
    );
  }
  return normalized;
}

export function requireNonEmpty(value: string | undefined, field: string) {
  const normalized = (value ?? '').trim();
  if (!normalized) {
    throw new BadRequestException(`${field} es obligatorio`);
  }
  return normalized;
}
