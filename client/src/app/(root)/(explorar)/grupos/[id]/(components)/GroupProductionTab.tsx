"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Spinner } from "@nextui-org/react";
import PrimaryButton from "@/components/buttons/PrimaryButton";
import { findAllProductionsByOwner } from "@/app/server/productionActions";
import { isProductionActionError } from "@/utils/functions/productionErrorHandler";
import {
  ProductionOwnerType,
  ProductionResponse,
} from "@/types/productionTypes";
import { CREATE_PRODUCTION } from "@/utils/data/urls";
import ProductionListCard from "../../../producciones/components/ProductionListCard";

interface Props {
  groupId: string;
  /** Sólo el creator del grupo puede crear el blog del grupo (GRP-02/03). */
  isCreator: boolean;
}

/**
 * Solapa "Producción del Grupo" (Fase 6). Muestra el blog del grupo si existe;
 * si no y el usuario es el creator, ofrece crearlo. Los roles (admin/moderator/
 * viewer) los resuelve el backend vía `viewer` dentro del blog.
 */
const GroupProductionTab = ({ groupId, isCreator }: Props) => {
  const [loading, setLoading] = useState(true);
  const [productions, setProductions] = useState<ProductionResponse[]>([]);

  useEffect(() => {
    let active = true;
    (async () => {
      const res = await findAllProductionsByOwner(
        groupId,
        ProductionOwnerType.Group
      );
      if (active && !isProductionActionError(res)) {
        setProductions(res);
      }
      if (active) setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, [groupId]);

  if (loading) {
    return (
      <div className="flex justify-center py-10">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col gap-4">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <h3>Producción del Grupo</h3>
        {isCreator && productions.length === 0 && (
          <PrimaryButton
            as={Link}
            href={`${CREATE_PRODUCTION}?groupId=${groupId}`}
          >
            Crear blog del grupo
          </PrimaryButton>
        )}
      </div>

      {productions.length === 0 ? (
        <p className="text-sm text-default-500">
          {isCreator
            ? "El grupo todavía no tiene un blog. Creá uno para empezar."
            : "Este grupo todavía no tiene un blog."}
        </p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {productions.map((production) => (
            <ProductionListCard
              key={production._id}
              production={production}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default GroupProductionTab;
