import { Subscription, SubscriptionPlan } from "@/types/subscriptions";
import { formatBytes } from "./formatBytes";

/**
 * Packs: agregados que se suman al plan mientras están activos. Un pack suma
 * anuncios, tokens de IA o almacenamiento (sólo trae cargado lo que suma).
 */
export type PackCategory = "anuncios" | "tokens" | "almacenamiento";

export const PACK_CATEGORY_LABELS: Record<PackCategory, string> = {
  anuncios: "Anuncios",
  tokens: "Tokens de IA",
  almacenamiento: "Almacenamiento",
};

export const PACK_CATEGORY_ORDER: PackCategory[] = [
  "anuncios",
  "tokens",
  "almacenamiento",
];

export const packCategoryOf = (plan: SubscriptionPlan): PackCategory => {
  if ((plan.postsLibresCount ?? 0) > 0 || (plan.postsAgendaCount ?? 0) > 0) {
    return "anuncios";
  }
  if ((plan.aiTokensPerMonth ?? 0) > 0) return "tokens";
  if ((plan.storageBytesLimit ?? 0) > 0) return "almacenamiento";
  return "anuncios";
};

/** Cantidad principal del pack, para ordenarlos de menor a mayor. */
export const packAmountOf = (plan: SubscriptionPlan): number => {
  switch (packCategoryOf(plan)) {
    case "tokens":
      return plan.aiTokensPerMonth ?? 0;
    case "almacenamiento":
      return plan.storageBytesLimit ?? 0;
    default:
      return (plan.postsLibresCount ?? 0) + (plan.postsAgendaCount ?? 0);
  }
};

/** Qué suma el pack, en líneas cortas para la tarjeta. */
export const describePack = (plan: SubscriptionPlan): string[] => {
  const lines: string[] = [];
  const libres = plan.postsLibresCount ?? 0;
  const agenda = plan.postsAgendaCount ?? 0;
  if (libres > 0 || agenda > 0) {
    lines.push(
      `+${libres} ${libres === 1 ? "anuncio geolocalizado" : "anuncios geolocalizados"} y +${agenda} de agenda`
    );
  }
  const tokens = plan.aiTokensPerMonth ?? 0;
  if (tokens > 0) {
    lines.push(`+${tokens.toLocaleString("es-AR")} tokens de IA por mes`);
  }
  const storage = plan.storageBytesLimit ?? 0;
  if (storage > 0) {
    lines.push(`+${formatBytes(storage)} de almacenamiento`);
  }
  return lines;
};

export const packFrequencyLabel = (plan: SubscriptionPlan): string =>
  plan.intervalTime === 90
    ? "por trimestre"
    : plan.intervalTime === 365
    ? "por año"
    : "por mes";

/** ¿El usuario ya tiene este pack activo? (se puede tener uno de cada uno). */
export const userHasPack = (
  plan: SubscriptionPlan,
  subscriptionsOfUser: Subscription[]
): boolean =>
  subscriptionsOfUser.some(
    (subscription) =>
      subscription.subscriptionPlan?.mpPreapprovalPlanId ===
        plan.mpPreapprovalPlanId &&
      (subscription.status === "authorized" || subscription.status === "active")
  );

/** Fecha de MercadoPago (ISO) como dd/mm/aaaa. */
export const formatPaymentDate = (date?: string | null): string | null => {
  if (!date) return null;
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed.toLocaleDateString("es-AR");
};
