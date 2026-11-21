"use client";
import { useCallback, useEffect, useState } from "react";
import {
  getMyProductionPhotoVotes,
  getProductionLoveItResults,
  setProductionPhotoVote,
} from "@/app/server/productionActions";
import { isProductionActionError } from "@/utils/functions/productionErrorHandler";
import { toastifyError } from "@/utils/functions/toastify";
import {
  ProductionLoveItPhoto,
  ProductionPhotoVote,
} from "@/types/productionTypes";

/**
 * Votos de Love It de un álbum. `canVote`: el usuario está logueado y el álbum
 * tiene Love It; trae sus votos para retomar donde lo dejó y marcarlos en la
 * grilla. `canViewResults`: staff del blog; trae los resultados de todos para
 * mostrarlos en cada foto.
 */
const useLoveIt = (
  folderId: string | undefined,
  { canVote, canViewResults }: { canVote: boolean; canViewResults: boolean }
) => {
  const [votes, setVotes] = useState<Map<string, ProductionPhotoVote>>(
    new Map()
  );
  const [results, setResults] = useState<Map<string, ProductionLoveItPhoto>>(
    new Map()
  );

  useEffect(() => {
    setVotes(new Map());
    if (!folderId || !canVote) return;
    let cancelled = false;
    getMyProductionPhotoVotes(folderId).then((res) => {
      if (cancelled || isProductionActionError(res)) return;
      setVotes(
        new Map(
          res
            .filter((entry) => entry.vote)
            .map((entry) => [entry.item, entry.vote as ProductionPhotoVote])
        )
      );
    });
    return () => {
      cancelled = true;
    };
  }, [folderId, canVote]);

  const loadResults = useCallback(async () => {
    if (!folderId || !canViewResults) {
      setResults(new Map());
      return;
    }
    const res = await getProductionLoveItResults(folderId);
    if (isProductionActionError(res)) return;
    setResults(new Map(res.photos.map((photo) => [photo.item, photo])));
  }, [folderId, canViewResults]);

  useEffect(() => {
    loadResults();
  }, [loadResults]);

  /** Guarda el voto al instante en pantalla; si el server lo rechaza, vuelve atrás. */
  const vote = useCallback(
    (itemId: string, value: ProductionPhotoVote) => {
      let previous: ProductionPhotoVote | undefined;
      setVotes((current) => {
        previous = current.get(itemId);
        const next = new Map(current);
        next.set(itemId, value);
        return next;
      });
      setProductionPhotoVote(itemId, value).then((res) => {
        if (!isProductionActionError(res)) return;
        toastifyError(res.error);
        setVotes((current) => {
          const next = new Map(current);
          if (previous) next.set(itemId, previous);
          else next.delete(itemId);
          return next;
        });
      });
    },
    []
  );

  return { votes, vote, results, reloadResults: loadResults };
};

export default useLoveIt;
