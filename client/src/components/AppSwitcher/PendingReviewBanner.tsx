"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { getMyPendingProductionReview } from "@/app/server/productionActions";
import { isProductionActionError } from "@/utils/functions/productionErrorHandler";
import { ProductionPendingReview } from "@/types/productionTypes";
import { PRODUCTIONS } from "@/utils/data/urls";

/**
 * Aviso persistente de reseña obligatoria pendiente (REV-02). Mientras exista,
 * el usuario no puede comprar tickets ni ver otros blogs. Se consulta al cargar.
 */
const PendingReviewBanner = () => {
  const [pending, setPending] = useState<ProductionPendingReview | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      const res = await getMyPendingProductionReview();
      if (active && res && !isProductionActionError(res)) {
        setPending(res);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  if (!pending) return null;

  return (
    <div className="w-full bg-warning-100 border border-warning-300 text-warning-800 text-sm px-4 py-2 rounded-lg flex items-center justify-between gap-3">
      <span>
        Tenés una reseña pendiente de <strong>{pending.productionTitle}</strong>.
        Completala para seguir usando Producciones.
      </span>
      <Link
        href={`${PRODUCTIONS}/${pending.productionId}`}
        className="font-medium underline whitespace-nowrap"
      >
        Reseñar ahora
      </Link>
    </div>
  );
};

export default PendingReviewBanner;
