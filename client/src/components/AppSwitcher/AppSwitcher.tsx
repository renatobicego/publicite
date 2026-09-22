"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FaBullhorn, FaBook, FaUsers } from "react-icons/fa";
import { POSTS, PRODUCTIONS, PROFILE } from "@/utils/data/urls";

type AppKey = "anuncios" | "producciones" | "social";

interface AppButton {
  key: AppKey;
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  /** Color de fondo de la card (naranja / magenta / celeste). */
  color: string;
  matchPrefixes: string[];
}

// Naranja actual (color "service" del tema). Magenta y celeste según diseño.
const ORANGE = "#F0931A";
const MAGENTA = "#8B008B";
const CYAN = "#1ACCF0";

const APPS: AppButton[] = [
  {
    key: "anuncios",
    label: "Anuncios",
    href: POSTS,
    icon: FaBullhorn,
    color: ORANGE,
    matchPrefixes: [POSTS],
  },
  {
    key: "producciones",
    label: "Producciones",
    href: PRODUCTIONS,
    icon: FaBook,
    color: MAGENTA,
    matchPrefixes: [PRODUCTIONS],
  },
  {
    key: "social",
    label: "Social",
    href: PROFILE,
    icon: FaUsers,
    color: CYAN,
    matchPrefixes: [PROFILE, "/revistas", "/grupos"],
  },
];

/**
 * Botonera de 3 apps (NAV-01): Anuncios (naranja) / Producciones (magenta) /
 * Social (celeste). Anuncios es el default. Cada botón navega a su sección.
 * Las cards se muestran siempre con su color; la activa lleva un subrayado.
 * `defaultActive` fuerza el resaltado cuando no hay match por ruta (ej. home).
 */
const AppSwitcher = ({
  defaultActive = "anuncios",
}: {
  defaultActive?: AppKey;
}) => {
  const pathname = usePathname() || "/";

  const activeKey =
    APPS.find((app) =>
      app.matchPrefixes.some((prefix) => pathname.startsWith(prefix))
    )?.key ?? defaultActive;

  return (
    <nav className="flex w-full gap-3 sm:gap-4" aria-label="Aplicaciones">
      {APPS.map((app) => {
        const Icon = app.icon;
        const isActive = app.key === activeKey;
        return (
          <div key={app.key} className="flex flex-1 flex-col gap-2">
            <Link
              href={app.href}
              aria-current={isActive ? "page" : undefined}
              style={{ backgroundColor: app.color }}
              className="flex h-[20vh] flex-col justify-end rounded-2xl p-4 text-white transition-transform hover:scale-[1.02]"
            >
              <Icon className="mb-2 text-2xl md:text-3xl xl:text-4xl" />
              <span className="text-base font-bold md:text-lg xl:text-xl 3xl:text-2xl">
                {app.label}
              </span>
            </Link>
            <span
              className="h-1 rounded-full transition-colors"
              style={{ backgroundColor: isActive ? app.color : "transparent" }}
            />
          </div>
        );
      })}
    </nav>
  );
};

export default AppSwitcher;
