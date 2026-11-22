import { BadRequestException } from '@nestjs/common';
import { normalizeAliasCbu } from 'src/contexts/module_shared/payout/alias-cbu';

/** Cuenta de cobro guardada: alias o CBU/CVU con un nombre opcional. */
export interface PayoutAccount {
  label: string | null;
  aliasCbu: string;
}

export const MAX_PAYOUT_ACCOUNTS = 10;
export const MAX_PAYOUT_LABEL_LENGTH = 40;

/**
 * Valida y normaliza la lista entera que manda el cliente (se guarda
 * reemplazando la anterior). Descarta repetidos y respeta el orden: la
 * primera es la que se propone por defecto al configurar un ticket.
 */
export function normalizePayoutAccounts(
  input: { label?: string | null; aliasCbu: string }[] | null | undefined,
): PayoutAccount[] {
  const accounts: PayoutAccount[] = [];
  const seen = new Set<string>();
  for (const raw of input ?? []) {
    const aliasCbu = normalizeAliasCbu(raw?.aliasCbu);
    const key = aliasCbu.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    const label = raw?.label?.trim() || null;
    if (label && label.length > MAX_PAYOUT_LABEL_LENGTH) {
      throw new BadRequestException(
        `El nombre de la cuenta puede tener hasta ${MAX_PAYOUT_LABEL_LENGTH} caracteres.`,
      );
    }
    accounts.push({ label, aliasCbu });
  }
  if (accounts.length > MAX_PAYOUT_ACCOUNTS) {
    throw new BadRequestException(
      `Podés guardar hasta ${MAX_PAYOUT_ACCOUNTS} cuentas de cobro.`,
    );
  }
  return accounts;
}
