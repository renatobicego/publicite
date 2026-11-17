"use client";

import GiftCube from "@/components/planGift/GiftCube";
import { monthsLabel } from "@/types/planGiftTypes";

export interface GiftCardRow {
  label: string;
  value: string;
  /** Texto de ayuda (p. ej. "Elegí a quién"): en cursiva y más tenue. */
  placeholder?: boolean;
}

/*
Tarjeta de regalo de un plan: el rosa de la marca con Cubito envuelto, el plan,
los meses, filas "Para / De / …" y un recuadro abajo (`children`) para el monto
o las acciones. La usan la vista previa de "Regalá un plan" y "Mis regalos".
`dimmed` la pasa a gris (regalos terminados, devueltos o rechazados).
*/
export default function GiftCard({
  planName,
  months,
  badge = "Regalo",
  rows,
  happy = false,
  dimmed = false,
  children,
  ariaLabel,
}: {
  planName: string;
  months: number;
  badge?: string;
  rows: GiftCardRow[];
  /** Cubito sonríe (regalo activo). */
  happy?: boolean;
  dimmed?: boolean;
  children?: React.ReactNode;
  ariaLabel?: string;
}) {
  return (
    <div
      className={`relative overflow-hidden rounded-3xl text-white p-6 shadow-lg ${
        dimmed
          ? "bg-gradient-to-br from-default-500 to-default-400"
          : "bg-gradient-to-br from-primary via-[#F2496A] to-[#F46A6A]"
      }`}
      aria-label={ariaLabel}
    >
      <GiftCardDecoration />
      <div className="relative flex items-center justify-between gap-2">
        <span className="text-xs font-semibold uppercase tracking-[0.2em] text-white/85">Soon</span>
        <span className="rounded-full bg-white/20 px-2.5 py-0.5 text-xs font-medium backdrop-blur-sm">
          {badge}
        </span>
      </div>

      <div className={`relative mx-auto my-4 size-32 rounded-full bg-white/90 p-4 shadow-inner ${dimmed ? "grayscale" : ""}`}>
        <GiftCube happy={happy} float={!dimmed} />
      </div>

      <div className="relative flex flex-col items-center text-center gap-0.5">
        <span className="text-2xl font-bold leading-tight">{planName}</span>
        <span className="text-sm text-white/85">{monthsLabel(months)} de plan</span>
      </div>

      <div className="relative my-5 border-t border-dashed border-white/40" />

      <dl className="relative grid grid-cols-[auto_1fr] gap-x-3 gap-y-1.5 text-sm">
        {rows.map((row) => (
          <div key={row.label} className="contents">
            <dt className="text-white/75">{row.label}</dt>
            <dd
              className={`text-right font-medium truncate ${row.placeholder ? "text-white/70 italic" : ""}`}
              title={row.value}
            >
              {row.value}
            </dd>
          </div>
        ))}
      </dl>

      {children && (
        <div className="relative mt-5 rounded-2xl bg-white/15 px-4 py-3 backdrop-blur-sm">
          {children}
        </div>
      )}
    </div>
  );
}

/** Círculos de fondo para darle profundidad a la tarjeta. */
export function GiftCardDecoration() {
  return (
    <>
      <span aria-hidden className="pointer-events-none absolute -right-10 -top-12 size-40 rounded-full bg-white/10" />
      <span aria-hidden className="pointer-events-none absolute -left-12 bottom-6 size-32 rounded-full bg-white/10" />
      <span aria-hidden className="pointer-events-none absolute left-7 top-20 size-5 rounded-full bg-[#FFC93C]/60" />
    </>
  );
}
