import { ProductionShelfCategory } from "@/types/productionTypes";

/**
 * Estantería del blog: recomendaciones cortas (libros, películas, podcasts,
 * links…) que el staff pone "en el estante", debajo del encabezado.
 */

export const SHELF_MAX_ITEMS = 40;
export const SHELF_TITLE_MAX = 40;
export const SHELF_SUBTITLE_MAX = 60;

export const SHELF_CATEGORIES: {
  key: ProductionShelfCategory;
  label: string;
  /** Texto de ayuda para el subtítulo. */
  subtitleHint: string;
}[] = [
  { key: ProductionShelfCategory.books, label: "Libro", subtitleHint: "Autor/a" },
  { key: ProductionShelfCategory.movies, label: "Película o serie", subtitleHint: "Director/a o año" },
  { key: ProductionShelfCategory.podcasts, label: "Podcast", subtitleHint: "Conductor/a o episodio" },
  { key: ProductionShelfCategory.music, label: "Música", subtitleHint: "Artista o álbum" },
  { key: ProductionShelfCategory.youtube, label: "Video de YouTube", subtitleHint: "Canal" },
  { key: ProductionShelfCategory.websites, label: "Link", subtitleHint: "De qué se trata" },
  { key: ProductionShelfCategory.images, label: "Imagen", subtitleHint: "Autor/a o lugar" },
  { key: ProductionShelfCategory.games, label: "Juego", subtitleHint: "Plataforma" },
  { key: ProductionShelfCategory.places, label: "Lugar", subtitleHint: "Ciudad" },
];

export const shelfCategoryLabel = (category: ProductionShelfCategory) =>
  SHELF_CATEGORIES.find((option) => option.key === category)?.label ?? "Link";

// Lomos en tonos de biblioteca: se elige uno por título, así cada objeto
// conserva su color aunque se reordene el estante.
const SPINE_COLORS = [
  "#7c2d12",
  "#1e3a8a",
  "#14532d",
  "#581c87",
  "#7f1d1d",
  "#0f766e",
  "#854d0e",
  "#334155",
  "#9d174d",
  "#3f6212",
];

export const spineColor = (title: string) => {
  let hash = 0;
  for (const char of title) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  return SPINE_COLORS[hash % SPINE_COLORS.length];
};

// Alto de cada lomo: varía un poco (como libros reales) pero es estable.
export const spineHeight = (title: string) => {
  let hash = 7;
  for (const char of title) hash = (hash * 17 + char.charCodeAt(0)) >>> 0;
  return 82 + (hash % 19); // 82% a 100% del alto del estante
};

/** Sólo links http(s); cualquier otra cosa no se abre. */
export const safeShelfLink = (link?: string | null) =>
  link && /^https?:\/\//i.test(link.trim()) ? link.trim() : null;
