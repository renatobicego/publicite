/**
 * Cada cuánto se cobra un plan, para leer al lado del precio: «por mes»,
 * «por año»…
 *
 * Los planes de MercadoPago lo dicen en `auto_recurring` (frequency +
 * frequency_type: "days" | "months" | "years"); los de la DB, en
 * `intervalTime` (días). El plan Gold anual, por ejemplo, está en MP como
 * «cada 1 years» y el Premium anual como «cada 12 months».
 */
export const frequencyLabelFromDays = (days?: number): string => {
  switch (days) {
    case 7:
      return "por semana";
    case 30:
      return "por mes";
    case 90:
      return "por trimestre";
    case 365:
      return "por año";
    default:
      return days ? `cada ${days} días` : "";
  }
};

export const frequencyLabelFromMP = (recurring?: {
  frequency?: number;
  frequency_type?: string;
}): string => {
  const n = recurring?.frequency ?? 1;
  switch (recurring?.frequency_type) {
    case "years":
      return n === 1 ? "por año" : `cada ${n} años`;
    case "months":
      if (n === 1) return "por mes";
      if (n === 3) return "por trimestre";
      if (n === 6) return "por semestre";
      if (n === 12) return "por año";
      return `cada ${n} meses`;
    case "days":
      return frequencyLabelFromDays(n);
    default:
      return "";
  }
};
