import { BadRequestException } from '@nestjs/common';

export const CBU_REGEX = /^\d{22}$/;
export const ALIAS_REGEX = /^[a-zA-Z0-9.-]{6,20}$/;

/** `true` si es un CBU/CVU (22 dígitos); si no, es un alias. */
export function isCbu(value: string | null | undefined): boolean {
  return !!value && CBU_REGEX.test(value);
}

/**
 * Alias (6 a 20 caracteres) o CBU/CVU (22 dígitos) para cobrar. Lo usan el
 * alias de cobro del blog (tickets) y las cuentas de cobro guardadas del
 * usuario.
 */
export function normalizeAliasCbu(value: string): string {
  const normalized = (value ?? '').trim();
  if (!CBU_REGEX.test(normalized) && !ALIAS_REGEX.test(normalized)) {
    throw new BadRequestException(
      'Ingresá un alias válido (6 a 20 caracteres: letras, números, puntos o guiones) o un CBU/CVU de 22 dígitos',
    );
  }
  return normalized;
}
