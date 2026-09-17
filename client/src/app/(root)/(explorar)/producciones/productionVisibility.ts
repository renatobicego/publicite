import { ProductionVisibility } from "@/types/productionTypes";

/** Etiquetas en español para el alcance/visibilidad. */
export const visibilityLabel: Record<ProductionVisibility, string> = {
  [ProductionVisibility.public]: "Público",
  [ProductionVisibility.registered]: "Registrados",
  [ProductionVisibility.contacts]: "Contactos",
  [ProductionVisibility.friends]: "Amigos",
  [ProductionVisibility.topfriends]: "Top amigos",
};

export const visibilityOptions = Object.values(ProductionVisibility);
