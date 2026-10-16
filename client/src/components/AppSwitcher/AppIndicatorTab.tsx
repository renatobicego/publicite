"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { APPS, resolveActiveApp } from "./apps";

/**
 * Pestaña que cuelga por debajo del header, a la derecha, con un cuadradito
 * del color de la app en la que está el usuario (Anuncios / Producciones /
 * Social). En el home se marca Anuncios, la app por defecto; en rutas que no
 * son de ninguna app (configuración, Cubito…) no se muestra.
 */
const AppIndicatorTab = ({ hidden = false }: { hidden?: boolean }) => {
  const pathname = usePathname() || "/";
  const activeKey =
    resolveActiveApp(pathname) ?? (pathname === "/" ? "anuncios" : undefined);
  const app = APPS.find((candidate) => candidate.key === activeKey);
  if (!app || hidden) return null;

  return (
    <Link
      href={app.href}
      aria-label={`Estás en ${app.label}`}
      title={`Estás en ${app.label}`}
      className="absolute right-8 top-full z-10 flex items-center gap-1.5 rounded-b-xl bg-white px-3 pb-1 pt-0.5 text-xs font-medium text-text-color shadow-md md:right-12 lg:right-16"
      // La sombra no debe tapar el borde inferior del header.
      style={{ clipPath: "inset(0 -12px -12px -12px)" }}
    >
      <span
        aria-hidden
        className="h-2.5 w-2.5 rounded-[3px]"
        style={{ backgroundColor: app.color }}
      />
      {app.label}
    </Link>
  );
};

export default AppIndicatorTab;
