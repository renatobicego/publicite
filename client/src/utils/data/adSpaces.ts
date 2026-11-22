import { IconType } from "react-icons";
import { FaRadio, FaTv, FaNewspaper, FaBookOpen } from "react-icons/fa6";
import { FaSignsPost } from "react-icons/fa6";
import { MdLiveTv } from "react-icons/md";
import { IoPeople } from "react-icons/io5";
import {
  AdSpaceCoverage,
  AdSpaceData,
  AdSpaceMedium,
} from "@/types/postTypes";
import { POST_AD_SPACES } from "./urls";

/**
 * Cómo se ubica cada medio: un lugar físico (dirección), algo de internet
 * (link) o un área de cobertura. Mismas reglas que `AD_SPACE_REACH` y
 * `normalizeAdSpace` del server: si cambian, cambiar los dos.
 */
export type AdSpaceReach = "place" | "online" | "area";

export type AdSpaceField = keyof AdSpaceData;

export interface AdSpaceMediumInfo {
  key: AdSpaceMedium;
  /** Nombre de la solapa. */
  label: string;
  /** Segmento de la URL: `/anuncios/espacios-publicitarios/<slug>`. */
  slug: string;
  icon: IconType;
  reach: AdSpaceReach;
  /** Cómo se llama "el medio" en este caso (emisora, canal…). */
  mediaNameLabel: string;
  /** Campos propios del medio, en orden. */
  fields: AdSpaceField[];
  /** Obligatorios además del nombre y del alcance. */
  required: AdSpaceField[];
}

export const AD_SPACE_MEDIUMS: AdSpaceMediumInfo[] = [
  {
    key: "radio",
    label: "Radio",
    slug: "radio",
    icon: FaRadio,
    reach: "area",
    mediaNameLabel: "Nombre de la radio",
    fields: ["band", "frequency", "program", "schedule"],
    required: ["band", "frequency"],
  },
  {
    key: "streaming",
    label: "Streaming",
    slug: "streaming",
    icon: MdLiveTv,
    reach: "online",
    mediaNameLabel: "Nombre del canal o programa",
    fields: ["platform", "program", "schedule"],
    required: ["platform"],
  },
  {
    key: "tv",
    label: "TV",
    slug: "tv",
    icon: FaTv,
    reach: "area",
    mediaNameLabel: "Canal",
    fields: ["program", "schedule"],
    required: [],
  },
  {
    key: "outdoor",
    label: "Vía pública",
    slug: "via-publica",
    icon: FaSignsPost,
    reach: "place",
    mediaNameLabel: "Nombre del espacio o empresa",
    fields: ["outdoorType", "dimensions", "illuminated"],
    required: ["outdoorType"],
  },
  {
    key: "newspaper",
    label: "Diario",
    slug: "diario",
    icon: FaNewspaper,
    reach: "area",
    mediaNameLabel: "Nombre del diario",
    fields: ["edition", "periodicity", "circulation", "section"],
    required: ["edition"],
  },
  {
    key: "magazine",
    label: "Revistas",
    slug: "revistas",
    icon: FaBookOpen,
    reach: "area",
    mediaNameLabel: "Nombre de la revista",
    fields: ["edition", "periodicity", "circulation", "section"],
    required: ["edition"],
  },
  {
    key: "influencer",
    label: "Influencers",
    slug: "influencers",
    icon: IoPeople,
    reach: "online",
    mediaNameLabel: "Nombre del influencer o cuenta",
    fields: ["networks", "handle", "followers", "engagement"],
    required: ["networks"],
  },
];

export const adSpaceMediumOf = (medium?: string | null) =>
  AD_SPACE_MEDIUMS.find((m) => m.key === medium);

export const adSpaceMediumBySlug = (slug?: string | null) =>
  AD_SPACE_MEDIUMS.find((m) => m.slug === slug);

export const adSpaceMediumUrl = (medium: AdSpaceMediumInfo) =>
  `${POST_AD_SPACES}/${medium.slug}`;

export const AD_SPACE_COVERAGE: { value: AdSpaceCoverage; label: string }[] = [
  { value: "neighborhood", label: "Barrio" },
  { value: "city", label: "Ciudad / localidad" },
  { value: "district", label: "Partido / departamento" },
  { value: "province", label: "Provincia" },
  { value: "region", label: "Región (varias provincias)" },
  { value: "country", label: "País" },
  { value: "international", label: "Internacional" },
];

export const adSpaceCoverageLabel = (value?: string | null) =>
  AD_SPACE_COVERAGE.find((c) => c.value === value)?.label ?? "";

export const AD_SPACE_EDITIONS = [
  { value: "print", label: "Papel" },
  { value: "digital", label: "Digital" },
  { value: "both", label: "Papel y digital" },
] as const;

/** Etiquetas de cada campo (formulario y detalle). */
export const AD_SPACE_FIELD_LABEL: Record<AdSpaceField, string> = {
  medium: "Medio",
  mediaName: "Medio",
  audience: "Audiencia estimada",
  formats: "Formatos que ofrece",
  mediaUrl: "Link",
  coverageArea: "Alcance del medio",
  coverageName: "Lugar del alcance",
  placeAddress: "Dirección",
  band: "Banda",
  frequency: "Frecuencia",
  platform: "Plataforma",
  program: "Programa",
  schedule: "Horario",
  outdoorType: "Tipo de soporte",
  dimensions: "Medidas",
  illuminated: "Iluminado",
  edition: "Edición",
  periodicity: "Periodicidad",
  circulation: "Tirada",
  section: "Sección",
  networks: "Redes",
  handle: "Usuario",
  followers: "Seguidores",
  engagement: "Engagement",
};

export const AD_SPACE_FIELD_PLACEHOLDER: Partial<Record<AdSpaceField, string>> = {
  audience: "Ej: 50.000 oyentes por día",
  frequency: "Ej: 99.5",
  program: "Ej: La mañana de Soon",
  schedule: "Ej: Lunes a viernes de 8 a 12",
  platform: "Ej: YouTube, Twitch, Kick",
  outdoorType: "Ej: Cartel, pantalla LED, medianera",
  dimensions: "Ej: 4 x 3 m",
  periodicity: "Ej: Diario, semanal, mensual",
  circulation: "Ej: 10.000 ejemplares",
  section: "Ej: Deportes, Clasificados",
  handle: "Ej: @soonpublicite",
  engagement: "Ej: 4,5%",
  coverageName: "Ej: Palermo, Córdoba, Cuyo",
  placeAddress: "Calle, número y localidad",
  mediaUrl: "https://",
};

export const AD_SPACE_NETWORK_OPTIONS = [
  "Instagram",
  "TikTok",
  "YouTube",
  "Facebook",
  "X",
  "Twitch",
  "Kick",
  "LinkedIn",
];

export const AD_SPACE_FORMAT_SUGGESTIONS: Record<AdSpaceMedium, string[]> = {
  radio: ['Spot 30"', "Mención", "Auspicio de programa", "Entrevista"],
  streaming: ["Mención en vivo", "Placa", "Auspicio de programa"],
  tv: ['Spot 30"', "PNT (publicidad no tradicional)", "Zócalo", "Auspicio"],
  outdoor: ["Mensual", "Quincenal", "Por día"],
  newspaper: ["Página completa", "Media página", "Clasificado", "Banner web"],
  magazine: ["Página completa", "Media página", "Contratapa", "Nota"],
  influencer: ["Posteo", "Historia", "Reel / video", "Live"],
};

export const emptyAdSpace = (medium: AdSpaceMedium): AdSpaceData => ({
  medium,
  mediaName: "",
  audience: "",
  formats: [],
  mediaUrl: "",
  coverageArea: null,
  coverageName: "",
  placeAddress: "",
  band: null,
  frequency: "",
  platform: "",
  program: "",
  schedule: "",
  outdoorType: "",
  dimensions: "",
  illuminated: null,
  edition: null,
  periodicity: "",
  circulation: "",
  section: "",
  networks: [],
  handle: "",
  followers: null,
  engagement: "",
});

const isBlank = (v: unknown) =>
  v === null ||
  v === undefined ||
  v === "" ||
  (Array.isArray(v) && v.length === 0);

/** Campos que se mandan al server según el medio (el resto se descarta). */
export const adSpacePayload = (data: AdSpaceData): AdSpaceData => {
  const info = adSpaceMediumOf(data.medium)!;
  const keys: AdSpaceField[] = [
    "medium",
    "mediaName",
    "audience",
    "formats",
    "mediaUrl",
    ...(info.reach === "area"
      ? (["coverageArea", "coverageName"] as AdSpaceField[])
      : []),
    ...(info.reach === "place" ? (["placeAddress"] as AdSpaceField[]) : []),
    ...info.fields,
  ];
  const out: Record<string, unknown> = {};
  for (const key of keys) {
    const value = data[key];
    if (key === "followers") {
      out[key] =
        value === null || value === undefined || (value as any) === ""
          ? null
          : Number(value);
    } else if (typeof value === "string") {
      out[key] = value.trim() || null;
    } else {
      out[key] = value ?? null;
    }
  }
  return out as unknown as AdSpaceData;
};

/** Mismas reglas que el server; devuelve el primer error o null. */
export const validateAdSpace = (data?: AdSpaceData | null): string | null => {
  if (!data?.medium) return "Elegí el medio del espacio publicitario.";
  const info = adSpaceMediumOf(data.medium);
  if (!info) return "El medio no es válido.";
  if (isBlank(data.mediaName?.trim())) return `Falta: ${info.mediaNameLabel}.`;
  if (info.reach === "place" && isBlank(data.placeAddress?.trim()))
    return "Falta la dirección del espacio.";
  if (info.reach === "area" && isBlank(data.coverageArea))
    return "Falta el alcance del medio.";
  const url = data.mediaUrl?.trim();
  if (info.reach === "online" && !url)
    return "Falta el link al sitio o perfil.";
  if (url && !/^https?:\/\/\S+$/i.test(url))
    return "El link tiene que empezar con http:// o https://";
  for (const field of info.required) {
    const value = data[field];
    if (isBlank(typeof value === "string" ? value.trim() : value))
      return `Falta: ${AD_SPACE_FIELD_LABEL[field].toLowerCase()}.`;
  }
  if (
    data.followers !== null &&
    data.followers !== undefined &&
    (data.followers as any) !== "" &&
    !(Number.isInteger(Number(data.followers)) && Number(data.followers) >= 0)
  )
    return "Los seguidores tienen que ser un número entero.";
  return null;
};

/** Condición frente al IVA de la cuenta Empresa / Agente. */
export const AD_AGENT_TAX_CONDITIONS = [
  { value: "responsableInscripto", label: "Responsable Inscripto (IVA RI)" },
  { value: "monotributo", label: "Monotributo" },
  { value: "exento", label: "IVA Exento" },
  { value: "noAlcanzado", label: "No alcanzado por IVA" },
] as const;

export type AdAgentTaxCondition =
  (typeof AD_AGENT_TAX_CONDITIONS)[number]["value"];

export const adAgentTaxLabel = (value?: string | null) =>
  AD_AGENT_TAX_CONDITIONS.find((t) => t.value === value)?.label ?? "";

export interface AdAgentProfile {
  userId: string;
  businessName?: string | null;
  countryRegion?: string | null;
  website: string;
  taxCondition: AdAgentTaxCondition;
  taxNote: string;
}
