import { ProductionVisibility } from "@/types/productionTypes";

/** Etiquetas en español para el alcance/visibilidad. */
export const visibilityLabel: Record<ProductionVisibility, string> = {
  [ProductionVisibility.public]: "Público",
  [ProductionVisibility.registered]: "Registrados",
  [ProductionVisibility.contacts]: "Contactos",
  [ProductionVisibility.friends]: "Amigos",
  [ProductionVisibility.topfriends]: "Top amigos",
  [ProductionVisibility.onlyMe]: "Sólo yo",
};

export const visibilityOptions = Object.values(ProductionVisibility);

/** "Sólo yo": lo ve únicamente el staff del blog, aunque haya clave. */
export const isOnlyMe = (visibility?: ProductionVisibility | null) =>
  visibility === ProductionVisibility.onlyMe;
