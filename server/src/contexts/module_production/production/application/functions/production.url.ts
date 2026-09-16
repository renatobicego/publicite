import { randomBytes } from 'crypto';

import { removeAccents_removeEmojisAndToLowerCase } from 'src/contexts/module_post/post/domain/utils/normalice.data';

const MAX_SLUG_LENGTH = 60;

/** Convierte un título en un slug apto para URL. */
export function slugifyProductionTitle(title: string): string {
  const slug = removeAccents_removeEmojisAndToLowerCase(title ?? '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, MAX_SLUG_LENGTH)
    .replace(/-+$/g, '');
  return slug || 'blog';
}

/**
 * URL autogenerada del blog (BLG-02): slug del título + sufijo aleatorio para
 * que dos blogs con el mismo nombre no choquen. No cambia si se edita el título,
 * así los links compartidos no se rompen.
 */
export function buildProductionUrl(title: string): string {
  const suffix = randomBytes(4).toString('hex').slice(0, 6);
  return `${slugifyProductionTitle(title)}-${suffix}`;
}
