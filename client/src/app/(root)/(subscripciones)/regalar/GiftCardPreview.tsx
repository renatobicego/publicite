"use client";

import GiftCube from "@/components/planGift/GiftCube";
import { monthsLabel } from "@/types/planGiftTypes";

export interface GiftCardPreviewProps {
  planName: string;
  months: number;
  /** Total ya formateado; null mientras se calcula. */
  total: string | null;
  /** A quién va; null si todavía no lo eligió. */
  recipient: string | null;
  giverName: string | null;
}

/*
Cómo queda el regalo, en vivo mientras se completa el formulario: una tarjeta de
regalo con Cubito envuelto. `compact` es la versión en una fila para el celular,
que va arriba del asistente.
*/
export default function GiftCardPreview({
  planName,
  months,
  total,
  recipient,
  giverName,
  compact = false,
}: GiftCardPreviewProps & { compact?: boolean }) {
  if (compact) {
    return (
      <div
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary to-[#F46A6A] text-white p-3 pr-4 flex items-center gap-3 shadow-md"
        aria-label="Vista previa del regalo"
      >
        <Decoration />
        <div className="relative size-14 shrink-0 rounded-full bg-white/90 p-1.5 shadow-inner">
          <GiftCube />
        </div>
        <div className="relative flex min-w-0 flex-1 flex-col">
          <span className="font-semibold leading-tight truncate">{planName}</span>
          <span className="text-xs text-white/85 truncate">
            {monthsLabel(months)} · Para: {recipient ?? "elegí a quién"}
          </span>
        </div>
        <span className="relative text-lg font-bold whitespace-nowrap">{total ?? "…"}</span>
      </div>
    );
  }

  return (
    <div
      className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-[#F2496A] to-[#F46A6A] text-white p-6 shadow-lg"
      aria-label="Vista previa del regalo"
    >
      <Decoration />
      <div className="relative flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-[0.2em] text-white/85">Soon</span>
        <span className="rounded-full bg-white/20 px-2.5 py-0.5 text-xs font-medium backdrop-blur-sm">
          Regalo
        </span>
      </div>

      <div className="relative mx-auto my-4 size-32 rounded-full bg-white/90 p-4 shadow-inner">
        <GiftCube />
      </div>

      <div className="relative flex flex-col items-center text-center gap-0.5">
        <span className="text-2xl font-bold leading-tight">{planName}</span>
        <span className="text-sm text-white/85">{monthsLabel(months)} de plan</span>
      </div>

      <div className="relative my-5 border-t border-dashed border-white/40" />

      <dl className="relative grid grid-cols-[auto_1fr] gap-x-3 gap-y-1.5 text-sm">
        <dt className="text-white/75">Para</dt>
        <dd className={`text-right font-medium truncate ${recipient ? "" : "text-white/70 italic"}`}>
          {recipient ?? "Elegí a quién"}
        </dd>
        <dt className="text-white/75">De</dt>
        <dd className="text-right font-medium truncate">{giverName ?? "Vos"}</dd>
      </dl>

      <div className="relative mt-5 flex items-end justify-between rounded-2xl bg-white/15 px-4 py-3 backdrop-blur-sm">
        <span className="text-sm text-white/85">Pago único</span>
        <span className="text-2xl font-bold">{total ?? "…"}</span>
      </div>
    </div>
  );
}

/** Círculos de fondo para darle profundidad a la tarjeta. */
function Decoration() {
  return (
    <>
      <span aria-hidden className="pointer-events-none absolute -right-10 -top-12 size-40 rounded-full bg-white/10" />
      <span aria-hidden className="pointer-events-none absolute -left-12 bottom-6 size-32 rounded-full bg-white/10" />
      <span aria-hidden className="pointer-events-none absolute left-7 top-20 size-5 rounded-full bg-[#FFC93C]/60" />
    </>
  );
}
