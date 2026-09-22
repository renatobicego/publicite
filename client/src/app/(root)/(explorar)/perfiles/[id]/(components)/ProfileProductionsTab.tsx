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
  userId: string;
  isMyProfile: boolean;
}

/**
 * Contenido de la solapa "Producciones" del cartel (Panel de Control, Fase 4).
 * Componente cliente: `UserSolapas` renderiza las solapas inline.
 * El Control de Consumo se muestra como modal general del cartel
 * (`ConsumptionControlModal`), no acá.
 */
const ProfileProductionsTab = ({ userId, isMyProfile }: Props) => {
  const [loading, setLoading] = useState(true);
  const [productions, setProductions] = useState<ProductionResponse[]>([]);

  useEffect(() => {
    let active = true;
    (async () => {
      const owned = await findAllProductionsByOwner(
        userId,
        ProductionOwnerType.User
      );
      if (active && !isProductionActionError(owned)) {
        setProductions(owned);
      }
      if (active) setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, [userId, isMyProfile]);

  if (loading) {
    return (
      <div className="flex justify-center py-10">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col gap-6">
      <section className="w-full flex flex-col gap-3">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <h3 className="text-lg font-semibold">Producciones</h3>
          {isMyProfile && (
            <PrimaryButton as={Link} href={CREATE_PRODUCTION}>
              Crear producción
            </PrimaryButton>
          )}
        </div>

        {productions.length === 0 ? (
          <p className="text-sm text-default-500">
            {isMyProfile
              ? "Todavía no creaste ninguna producción."
              : "Este usuario todavía no tiene producciones."}
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
      </section>
    </div>
  );
};

export default ProfileProductionsTab;
