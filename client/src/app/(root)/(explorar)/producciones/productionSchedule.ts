/**
 * Fechas de vigencia de un blog. El formulario trabaja con días (`YYYY-MM-DD`
 * de `<input type="date">`) y al server se manda el inicio del primer día y el
 * final del último, en la hora local de quien edita.
 */

/** Día local de una fecha ISO, para un `<input type="date">`. */
export const toDateInput = (iso?: string | Date | null) => {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
};

export const todayInput = () => toDateInput(new Date());

const parseDay = (day: string) => {
  const [y, m, d] = day.split("-").map(Number);
  if (!y || !m || !d) return null;
  return { y, m, d };
};

/** Inicio del día local (00:00) en ISO. */
export const startOfDayIso = (day: string) => {
  const parts = parseDay(day);
  return parts
    ? new Date(parts.y, parts.m - 1, parts.d, 0, 0, 0, 0).toISOString()
    : undefined;
};

/** Final del día local (23:59:59.999) en ISO. */
export const endOfDayIso = (day: string) => {
  const parts = parseDay(day);
  return parts
    ? new Date(parts.y, parts.m - 1, parts.d, 23, 59, 59, 999).toISOString()
    : undefined;
};

/** Mensaje de error del rango, o null si es válido. */
export const validateSchedule = (from: string, until: string) => {
  if (!from) return "La fecha de inicio es obligatoria";
  if (until && until < from) {
    return "La fecha de cierre no puede ser anterior a la de inicio";
  }
  return null;
};

export type ScheduleStatus = "active" | "upcoming" | "ended";

export const getScheduleStatus = (
  schedule: { activeFrom?: string | null; activeUntil?: string | null },
  now: Date = new Date()
): ScheduleStatus => {
  if (schedule.activeFrom && now < new Date(schedule.activeFrom)) {
    return "upcoming";
  }
  if (schedule.activeUntil && now > new Date(schedule.activeUntil)) {
    return "ended";
  }
  return "active";
};

const formatDay = (iso: string) =>
  new Date(iso).toLocaleDateString("es-AR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

/** "del 3 de marzo de 2027 al 10 de abril de 2027" / "desde el …". */
export const formatScheduleRange = (schedule: {
  activeFrom?: string | null;
  activeUntil?: string | null;
}) => {
  const { activeFrom, activeUntil } = schedule;
  if (activeFrom && activeUntil) {
    return `del ${formatDay(activeFrom)} al ${formatDay(activeUntil)}`;
  }
  if (activeFrom) return `desde el ${formatDay(activeFrom)}`;
  if (activeUntil) return `hasta el ${formatDay(activeUntil)}`;
  return "sin fechas";
};
