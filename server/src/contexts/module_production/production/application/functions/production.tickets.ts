import { BadRequestException } from '@nestjs/common';

import {
  getTicketCommissionPercent,
  getTicketMinDurationHours,
} from 'src/contexts/module_shared/production-limits/production.limits.config';

/** Reparto de un ticket pago: comisión de Soonpublicité y liquidación al creador. */
export function computeTicketSplit(amount: number): {
  commissionPercent: number;
  commissionAmount: number;
  creatorPayoutAmount: number;
} {
  const commissionPercent = getTicketCommissionPercent();
  const commissionAmount = Math.round(amount * commissionPercent) / 100;
  const creatorPayoutAmount =
    Math.round((amount - commissionAmount) * 100) / 100;
  return { commissionPercent, commissionAmount, creatorPayoutAmount };
}

export interface TicketConfigInput {
  isPaid: boolean;
  price?: number | null;
  durationHours?: number | null;
  untilClose?: boolean | null;
}

/**
 * Valida la configuración de un ticket (TKT-02/03): un ticket pago necesita
 * precio; la duración es de al menos 24 hs o "hasta el cierre del blog".
 */
export function validateTicketConfig(input: TicketConfigInput): {
  isPaid: boolean;
  price: number;
  durationHours: number | null;
  untilClose: boolean;
} {
  const untilClose = !!input.untilClose;
  const price = input.isPaid ? Number(input.price ?? 0) : 0;

  if (input.isPaid && !(price > 0)) {
    throw new BadRequestException('Un ticket pago necesita un precio mayor a 0');
  }

  let durationHours: number | null = null;
  if (!untilClose) {
    const minHours = getTicketMinDurationHours();
    durationHours = Math.floor(Number(input.durationHours ?? 0));
    if (!(durationHours >= minHours)) {
      throw new BadRequestException(
        `La duración del ticket tiene que ser de al menos ${minHours} horas, o hasta el cierre del blog`,
      );
    }
  }

  return {
    isPaid: input.isPaid,
    price: Math.round(price * 100) / 100,
    durationHours,
    untilClose,
  };
}

/** Vencimiento del acceso desde que se habilita (TKT-07/08). */
export function computeTicketExpiration(
  activatedAt: Date,
  durationHours: number | null,
  untilClose: boolean,
): Date | null {
  if (untilClose || !durationHours) return null;
  return new Date(activatedAt.getTime() + durationHours * 60 * 60 * 1000);
}

const CBU_REGEX = /^\d{22}$/;
const ALIAS_REGEX = /^[a-zA-Z0-9.-]{6,20}$/;

/** Alias (6 a 20 caracteres) o CBU/CVU (22 dígitos) para liquidar (TKT-11). */
export function normalizeAliasCbu(value: string): string {
  const normalized = (value ?? '').trim();
  if (!CBU_REGEX.test(normalized) && !ALIAS_REGEX.test(normalized)) {
    throw new BadRequestException(
      'Ingresá un alias válido (6 a 20 caracteres: letras, números, puntos o guiones) o un CBU/CVU de 22 dígitos',
    );
  }
  return normalized;
}
