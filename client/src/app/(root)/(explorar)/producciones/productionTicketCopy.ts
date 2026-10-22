/**
 * Textos de los tickets de Mis Producciones, compartidos entre el staff (al
 * configurarlos) y el visitante (al sacarlos), para que todas las pantallas
 * digan lo mismo.
 *
 * Hay tres tipos de acceso:
 * - Libre: sin ticket, se entra directo.
 * - Ticket gratuito: no cuesta nada, pero el visitante saca su ticket con un
 *   clic. Sirve para saber cuánta gente entra.
 * - Ticket pago: el visitante paga por transferencia y el blog habilita el
 *   acceso.
 */

export type TicketAccessType = "free" | "freeTicket" | "paid";

export const ticketAccessOptions: {
  key: TicketAccessType;
  label: string;
  description: string;
}[] = [
  {
    key: "free",
    label: "Libre",
    description: "Sin ticket. Cualquiera que pueda ver el blog entra directo.",
  },
  {
    key: "freeTicket",
    label: "Ticket gratuito",
    description:
      "No cuesta nada, pero el visitante saca su ticket con un clic. Así sabés cuánta gente entra.",
  },
  {
    key: "paid",
    label: "Ticket pago",
    description:
      "El visitante paga por transferencia y vos habilitás su acceso cuando te llega.",
  },
];

/** Atajos de duración del acceso, en horas. */
export const ticketDurationPresets: { hours: number; label: string }[] = [
  { hours: 24, label: "1 día" },
  { hours: 168, label: "1 semana" },
  { hours: 720, label: "1 mes" },
];

const plural = (n: number, one: string, many: string) =>
  `${n} ${n === 1 ? one : many}`;

/** "1 día", "2 semanas", "36 horas"… */
export const formatTicketHours = (hours: number) => {
  if (hours % 720 === 0) return plural(hours / 720, "mes", "meses");
  if (hours % 168 === 0) return plural(hours / 168, "semana", "semanas");
  if (hours % 24 === 0) return plural(hours / 24, "día", "días");
  return plural(hours, "hora", "horas");
};

/** Cuánto dura el acceso, para mostrar al visitante. */
export const formatTicketDuration = (ticket: {
  durationHours?: number | null;
  untilClose: boolean;
}) =>
  ticket.untilClose || !ticket.durationHours
    ? "sin vencimiento"
    : `por ${formatTicketHours(ticket.durationHours)}`;

export const formatTicketPrice = (ticket: { price: number; currency: string }) =>
  `${ticket.currency} ${ticket.price.toLocaleString("es-AR", {
    maximumFractionDigits: 2,
  })}`;

/** Texto del botón con el que el visitante saca o compra el ticket. */
export const ticketActionLabel = (ticket: {
  isPaid: boolean;
  price: number;
  currency: string;
}) =>
  ticket.isPaid
    ? `Comprar ticket · ${formatTicketPrice(ticket)}`
    : "Sacar ticket gratis";
