"use client";

import { Novedad } from "@/types/novedades";
import { NovedadCard } from "./NovedadCard";

interface NovedadesGridProps {
  novedades: Novedad[];
  isAdmin: boolean;
}

export function NovedadesGrid({ novedades, isAdmin }: NovedadesGridProps) {
  if (novedades.length === 0) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card/50 p-8 text-center">
        <div className="mb-4 rounded-full bg-muted p-4">
          <svg
            className="h-8 w-8 text-muted-foreground"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
            />
          </svg>
        </div>
        <h3 className="mb-2 text-lg font-medium text-text-color">
          No hay novedades
        </h3>
        <p className="text-sm text-muted-foreground">
          Las novedades aparecerán aquí cuando se publiquen.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {novedades.map((novedad) => (
        <NovedadCard key={novedad.id} novedad={novedad} isAdmin={isAdmin} />
      ))}
    </div>
  );
}
