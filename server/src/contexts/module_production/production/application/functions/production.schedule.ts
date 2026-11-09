import { BadRequestException } from '@nestjs/common';

/**
 * Fechas de vigencia de un blog: fuera del rango no se lista en Explorar ni en
 * el cartel y el visitante que entra por link ve sólo un aviso. No borra nada.
 *
 * El cliente manda el inicio del día elegido (`activeFrom`) y el final del día
 * de cierre (`activeUntil`) en su zona horaria, así que acá se compara contra
 * el instante actual sin redondear.
 */
export interface ProductionSchedule {
  activeFrom?: Date | null;
  activeUntil?: Date | null;
}

export function isWithinSchedule(
  schedule: ProductionSchedule,
  now: Date = new Date(),
): boolean {
  const { activeFrom, activeUntil } = schedule;
  if (activeFrom && now < new Date(activeFrom)) return false;
  if (activeUntil && now > new Date(activeUntil)) return false;
  return true;
}

/** Condición de Mongo equivalente a `isWithinSchedule` (para los listados). */
export function buildScheduleQuery(now: Date): Record<string, any> {
  return {
    $and: [
      { $or: [{ activeFrom: null }, { activeFrom: { $lte: now } }] },
      { $or: [{ activeUntil: null }, { activeUntil: { $gte: now } }] },
    ],
  };
}

/** Valida y normaliza el rango: la fecha de cierre no puede ser anterior. */
export function normalizeSchedule(
  activeFrom: Date | string | null | undefined,
  activeUntil: Date | string | null | undefined,
): { activeFrom: Date | null; activeUntil: Date | null } {
  const from = toDate(activeFrom, 'La fecha de inicio');
  const until = toDate(activeUntil, 'La fecha de cierre');
  if (from && until && until < from) {
    throw new BadRequestException(
      'La fecha de cierre no puede ser anterior a la fecha de inicio',
    );
  }
  return { activeFrom: from, activeUntil: until };
}

function toDate(value: Date | string | null | undefined, label: string) {
  if (value === null || value === undefined || value === '') return null;
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw new BadRequestException(`${label} no es válida`);
  }
  return date;
}
