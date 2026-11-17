"use client";

import GiftCard, { GiftCardDecoration } from "@/components/planGift/GiftCard";
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
        <GiftCardDecoration />
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
    <GiftCard
      planName={planName}
      months={months}
      ariaLabel="Vista previa del regalo"
      rows={[
        { label: "Para", value: recipient ?? "Elegí a quién", placeholder: !recipient },
        { label: "De", value: giverName ?? "Vos" },
      ]}
    >
      <div className="flex items-end justify-between">
        <span className="text-sm text-white/85">Pago único</span>
        <span className="text-2xl font-bold">{total ?? "…"}</span>
      </div>
    </GiftCard>
  );
}
