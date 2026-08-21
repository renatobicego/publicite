/**
 * Formatea las fechas de los tickets para el panel admin.
 *
 * `timeOfUpdate` se guarda como ZonedDateTime string
 * ("2026-08-20T19:18:00-03:00[America/Argentina/Buenos_Aires]"), pero hay
 * registros viejos sin fecha o con formatos raros: acá nunca tira, devuelve "-".
 */
export const formatAdminDate = (value?: string | null): string => {
  if (!value) return "-";

  const date = new Date(value.replace(/\[.*\]$/, ""));
  if (isNaN(date.getTime())) return value;

  const dd = String(date.getDate()).padStart(2, "0");
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const yyyy = date.getFullYear();
  const hh = String(date.getHours()).padStart(2, "0");
  const min = String(date.getMinutes()).padStart(2, "0");

  return `${dd}/${mm}/${yyyy} ${hh}:${min}`;
};

export const formatAdminDateShort = (value?: string | null): string => {
  const formatted = formatAdminDate(value);
  return formatted === "-" ? formatted : formatted.split(" ")[0];
};
