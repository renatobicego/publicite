import {
  ProductionCollectionType,
  ProductionFileType,
  ProductionItemKind,
  ProductionItemResponse,
  ProductionPhotoVote,
} from "@/types/productionTypes";

/**
 * Colecciones: carpetas dedicadas a algo específico (un álbum, una película,
 * una serie de videos, un disco). Cada una tiene su propia presentación arriba
 * de la grilla. Los textos que comparten la configuración, el encabezado y las
 * tarjetas viven acá.
 */
export const COLLECTION_TYPES: {
  key: ProductionCollectionType;
  label: string;
  emoji: string;
  description: string;
}[] = [
  {
    key: ProductionCollectionType.album,
    label: "Álbum",
    emoji: "📸",
    description:
      "Fotos y videos, todos del mismo tamaño. Podés activar Love It para que voten las fotos.",
  },
  {
    key: ProductionCollectionType.movie,
    label: "Película",
    emoji: "🎬",
    description:
      "Un video principal con afiche y sinopsis. Lo demás (tráiler, fotos del rodaje) va debajo.",
  },
  {
    key: ProductionCollectionType.series,
    label: "Serie de videos",
    emoji: "📺",
    description:
      "Videos en orden, como capítulos: al terminar uno empieza el siguiente.",
  },
  {
    key: ProductionCollectionType.music,
    label: "Disco / audios",
    emoji: "🎵",
    description:
      "Audios en orden, como un disco o un podcast, con tapa y lista de temas.",
  },
];

export const collectionMeta = (type?: ProductionCollectionType | null) =>
  COLLECTION_TYPES.find((option) => option.key === type) ?? null;

/** Love It sólo funciona en álbumes y sólo con fotos. */
export const isPhotoItem = (item: ProductionItemResponse) =>
  item.kind === ProductionItemKind.file &&
  item.fileType === ProductionFileType.photo;

export const itemsOfType = (
  items: ProductionItemResponse[],
  type: ProductionFileType
) =>
  items.filter(
    (item) => item.kind === ProductionItemKind.file && item.fileType === type
  );

/**
 * Orden natural por nombre ("Capítulo 2" antes que "Capítulo 10"): así se
 * arman los capítulos de una serie y los temas de un disco.
 */
export const sortByNameNatural = (items: ProductionItemResponse[]) =>
  [...items].sort((a, b) =>
    (a.name || a.fileName || "").localeCompare(
      b.name || b.fileName || "",
      "es",
      { numeric: true, sensitivity: "base" }
    )
  );

/**
 * Love It: cada voto es una dirección (la hora del reloj hacia donde se lleva
 * la foto). Arriba Fan, derecha Me gusta, abajo Más o menos, izquierda No.
 */
export const LOVE_IT_VOTES: {
  vote: ProductionPhotoVote;
  label: string;
  emoji: string;
  /** Hora del reloj hacia donde se lleva la foto en desktop. */
  clock: string;
  key: string;
  /** Hacia dónde sale volando la foto. */
  dx: number;
  dy: number;
  color: string;
}[] = [
  {
    vote: ProductionPhotoVote.fan,
    label: "Fan",
    emoji: "💖",
    clock: "12 h",
    key: "ArrowUp",
    dx: 0,
    dy: -1,
    color: "#ec4899",
  },
  {
    vote: ProductionPhotoVote.like,
    label: "Me gusta",
    emoji: "👍",
    clock: "15 h",
    key: "ArrowRight",
    dx: 1,
    dy: 0,
    color: "#22c55e",
  },
  {
    vote: ProductionPhotoVote.maybe,
    label: "Más o menos",
    emoji: "🤔",
    clock: "18 h",
    key: "ArrowDown",
    dx: 0,
    dy: 1,
    color: "#f59e0b",
  },
  {
    vote: ProductionPhotoVote.no,
    label: "No",
    emoji: "✖️",
    clock: "21 h",
    key: "ArrowLeft",
    dx: -1,
    dy: 0,
    color: "#64748b",
  },
];

export const voteMeta = (vote?: ProductionPhotoVote | null) =>
  LOVE_IT_VOTES.find((option) => option.vote === vote) ?? null;
