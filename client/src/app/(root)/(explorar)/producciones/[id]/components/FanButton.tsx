"use client";
import { useState } from "react";
import { Button } from "@nextui-org/react";
import { toastifyError } from "@/utils/functions/toastify";
import {
  becomeProductionFan,
  stopBeingProductionFan,
} from "@/app/server/productionActions";
import { isProductionActionError } from "@/utils/functions/productionErrorHandler";

interface Props {
  productionId: string;
  isFan: boolean;
  fansCount: number;
  onChanged: () => void;
  /** Sólo el contador, sin el botón (staff del blog). */
  readOnly?: boolean;
  /**
   * Vista previa de visitante: la acción se muestra pero no se ejecuta; en su
   * lugar se llama a esto (avisa que hay que volver a editar).
   */
  onBlocked?: () => void;
}

const fansLabel = (count: number) =>
  count === 1 ? "1 fan" : `${count.toLocaleString("es-AR")} fans`;

/**
 * Fans del blog (FAN-01): el contador siempre visible junto al título y, para
 * el visitante, el botón para hacerse fan. El dueño no puede ser fan (el
 * backend lo valida), así que con `readOnly` sólo ve el contador.
 */
const FanButton = ({
  productionId,
  isFan,
  fansCount,
  onChanged,
  readOnly = false,
  onBlocked,
}: Props) => {
  const [busy, setBusy] = useState(false);

  const toggle = async () => {
    setBusy(true);
    try {
      const res = isFan
        ? await stopBeingProductionFan(productionId)
        : await becomeProductionFan(productionId);
      if (isProductionActionError(res)) {
        toastifyError(res.error);
        return;
      }
      onChanged();
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span
        className="inline-flex items-center gap-1.5 rounded-full border border-danger-200 bg-danger-50 px-3 py-1 text-sm font-semibold text-danger-700"
        title="Fans del blog"
      >
        <span aria-hidden className="text-base leading-none">
          {fansCount > 0 ? "💖" : "🤍"}
        </span>
        {fansCount > 0 ? fansLabel(fansCount) : "Todavía sin fans"}
      </span>
      {!readOnly && (
        <Button
          size="sm"
          radius="full"
          variant={isFan ? "flat" : "solid"}
          color="danger"
          onPress={onBlocked ?? toggle}
          isDisabled={busy}
          aria-pressed={isFan}
        >
          {isFan
            ? "💖 Sos fan"
            : fansCount > 0
              ? "🤍 Hacerme fan"
              : "✨ Sé el primer fan"}
        </Button>
      )}
    </div>
  );
};

export default FanButton;
