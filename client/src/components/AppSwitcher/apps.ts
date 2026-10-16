import { FaBullhorn, FaBook, FaUsers } from "react-icons/fa";
import {
  BOARDS,
  GROUPS,
  MAGAZINES,
  POSTS,
  PRODUCTIONS,
  PROFILE,
} from "@/utils/data/urls";

export type AppKey = "anuncios" | "producciones" | "social";

export interface AppInfo {
  key: AppKey;
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  /** Color de la app (naranja / magenta / celeste). */
  color: string;
}

// Naranja actual (color "service" del tema). Magenta y celeste según diseño.
const ORANGE = "#F0931A";
const MAGENTA = "#8B008B";
const CYAN = "#1ACCF0";

export const APPS: AppInfo[] = [
  {
    key: "anuncios",
    label: "Anuncios",
    href: POSTS,
    icon: FaBullhorn,
    color: ORANGE,
  },
  {
    key: "producciones",
    label: "Producciones",
    href: PRODUCTIONS,
    icon: FaBook,
    color: MAGENTA,
  },
  {
    key: "social",
    label: "Social",
    href: PROFILE,
    icon: FaUsers,
    color: CYAN,
  },
];

const segmentsOf = (pathname: string) => pathname.split("/").filter(Boolean);

/**
 * App en la que está el usuario según la ruta, o `undefined` si la ruta no es
 * de ninguna (configuración, Cubito, suscripciones…). Producciones se mira
 * primero porque también vive dentro del cartel (`/perfiles/:id/producciones`),
 * y las rutas de crear/editar cuentan para la app de lo que se crea.
 */
export const resolveActiveApp = (pathname: string): AppKey | undefined => {
  const segments = segmentsOf(pathname);
  if (segments.some((s) => s === "producciones" || s === "produccion")) {
    return "producciones";
  }
  const first = `/${segments[0] ?? ""}`;
  const isCreateOrEdit = first === "/crear" || first === "/editar";
  const target = isCreateOrEdit ? segments[1] : undefined;
  if (
    [PROFILE, MAGAZINES, GROUPS, BOARDS].includes(first) ||
    target === "revista" ||
    target === "grupo"
  ) {
    return "social";
  }
  if (first === POSTS || target === "anuncio" || target === "necesidad") {
    return "anuncios";
  }
  return undefined;
};
