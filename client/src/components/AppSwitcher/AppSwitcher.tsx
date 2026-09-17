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
  /** Clases de color activo (naranja / magenta / celeste). */
  activeClass: string;
  matchPrefixes: string[];
}

const APPS: AppButton[] = [
  {
    key: "anuncios",
    label: "Anuncios",
    href: POSTS,
    icon: FaBullhorn,
    activeClass: "bg-primary text-white border-primary",
    matchPrefixes: [POSTS],
  },
  {
    key: "producciones",
    label: "Producciones",
    href: PRODUCTIONS,
    icon: FaBook,
    activeClass: "bg-[#D6249F] text-white border-[#D6249F]",
    matchPrefixes: [PRODUCTIONS],
  },
  {
    key: "social",
    label: "Social",
    href: PROFILE,
    icon: FaUsers,
    activeClass: "bg-[#20A4F3] text-white border-[#20A4F3]",
    matchPrefixes: [PROFILE, "/revistas", "/grupos"],
  },
];

/**
 * Botonera de 3 apps (NAV-01): Anuncios (naranja) / Producciones (magenta) /
 * Social (celeste). Anuncios es el default. Cada botón navega a su sección.
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
    <nav className="flex w-full gap-2 sm:gap-3" aria-label="Aplicaciones">
      {APPS.map((app) => {
        const Icon = app.icon;
        const isActive = app.key === activeKey;
        return (
          <Link
            key={app.key}
            href={app.href}
            className={`flex-1 flex items-center justify-center gap-2 rounded-full border px-3 py-2 text-sm font-medium transition-colors ${
              isActive
                ? app.activeClass
                : "border-default-200 text-default-600 hover:bg-default-100"
            }`}
          >
            <Icon className="text-base" />
            <span className="hidden sm:inline">{app.label}</span>
          </Link>
        );
      })}
    </nav>
  );
};

export default AppSwitcher;
