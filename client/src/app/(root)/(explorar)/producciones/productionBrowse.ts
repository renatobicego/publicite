import {
  ProductionFileType,
  ProductionItemKind,
  ProductionItemResponse,
} from "@/types/productionTypes";

/** Filtro por tipo de elemento de la grilla de un blog. */
export type ProductionTypeFilter =
  | "all"
  | ProductionItemKind.folder
  | ProductionItemKind.article
  | ProductionFileType;

export type ProductionSort =
  | "recent"
  | "oldest"
  | "nameAsc"
  | "nameDesc"
  | "type";

export type ProductionViewMode = "grid" | "list";

export const PRODUCTION_TYPE_FILTERS: {
  key: ProductionTypeFilter;
  label: string;
}[] = [
  { key: "all", label: "Todo" },
  { key: ProductionItemKind.folder, label: "Carpetas" },
  { key: ProductionFileType.photo, label: "Fotos" },
  { key: ProductionFileType.video, label: "Videos" },
  { key: ProductionFileType.audio, label: "Audios" },
  { key: ProductionFileType.writing, label: "Escritos (PDF)" },
  { key: ProductionFileType.document, label: "Documentos" },
  { key: ProductionItemKind.article, label: "Artículos" },
];

export const PRODUCTION_SORTS: { key: ProductionSort; label: string }[] = [
  { key: "recent", label: "Más recientes" },
  { key: "oldest", label: "Más antiguos" },
  { key: "nameAsc", label: "Nombre (A-Z)" },
  { key: "nameDesc", label: "Nombre (Z-A)" },
  { key: "type", label: "Tipo" },
];

/** Clave de tipo de un ítem, comparable con `ProductionTypeFilter`. */
const typeKeyOf = (item: ProductionItemResponse): ProductionTypeFilter =>
  item.kind === ProductionItemKind.file
    ? (item.fileType ?? ProductionFileType.document)
    : item.kind;

const TYPE_LABELS: Record<string, string> = {
  [ProductionItemKind.folder]: "Carpeta",
  [ProductionItemKind.article]: "Artículo",
  [ProductionFileType.photo]: "Foto",
  [ProductionFileType.video]: "Video",
  [ProductionFileType.audio]: "Audio",
  [ProductionFileType.writing]: "Escrito (PDF)",
  [ProductionFileType.document]: "Documento",
};

export const itemTypeLabel = (item: ProductionItemResponse): string =>
  TYPE_LABELS[typeKeyOf(item)] ?? "Archivo";

// Sin tildes ni mayúsculas, para que "camion" encuentre "Camión".
const normalize = (text: string | null | undefined) =>
  (text ?? "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();

const timeOf = (item: ProductionItemResponse) =>
  item.createdAt ? new Date(item.createdAt).getTime() : 0;

const compareName = (a: ProductionItemResponse, b: ProductionItemResponse) =>
  a.name.localeCompare(b.name, "es", { numeric: true, sensitivity: "base" });

const comparators: Record<
  ProductionSort,
  (a: ProductionItemResponse, b: ProductionItemResponse) => number
> = {
  recent: (a, b) => timeOf(b) - timeOf(a),
  oldest: (a, b) => timeOf(a) - timeOf(b),
  nameAsc: compareName,
  nameDesc: (a, b) => compareName(b, a),
  type: (a, b) =>
    itemTypeLabel(a).localeCompare(itemTypeLabel(b), "es") ||
    compareName(a, b),
};

/**
 * Filtra y ordena los ítems del nivel que se está viendo. Como en un
 * explorador de archivos, las carpetas quedan siempre primero.
 */
export const filterAndSortItems = (
  items: ProductionItemResponse[],
  options: { search: string; type: ProductionTypeFilter; sort: ProductionSort }
): ProductionItemResponse[] => {
  const term = normalize(options.search.trim());
  const isFolder = (item: ProductionItemResponse) =>
    item.kind === ProductionItemKind.folder;
  return items
    .filter(
      (item) =>
        (options.type === "all" || typeKeyOf(item) === options.type) &&
        (!term ||
          normalize(item.name).includes(term) ||
          normalize(item.fileName).includes(term))
    )
    .sort(
      (a, b) =>
        Number(isFolder(b)) - Number(isFolder(a)) ||
        comparators[options.sort](a, b)
    );
};

/** Tipo de dato del arrastre de ítems dentro del blog (mover a una carpeta). */
export const PRODUCTION_ITEMS_DRAG_TYPE = "application/x-soon-production-items";

/** El arrastre trae archivos del sistema operativo (subida). */
export const isFileDrag = (event: React.DragEvent) =>
  Array.from(event.dataTransfer.types).includes("Files");

/** El arrastre trae ítems del propio blog (mover). */
export const isItemsDrag = (event: React.DragEvent) =>
  Array.from(event.dataTransfer.types).includes(PRODUCTION_ITEMS_DRAG_TYPE);

/**
 * Parámetros de la URL del blog: carpeta abierta (`?carpeta=<id>`) y vista
 * previa de visitante (`?vista=visitante`). Viven acá, fuera de los
 * componentes cliente, porque también los leen las páginas (server).
 */
export const FOLDER_PARAM = "carpeta";
export const PREVIEW_PARAM = "vista";
export const PREVIEW_VALUE = "visitante";
