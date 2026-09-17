"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardBody, Progress, Spinner } from "@nextui-org/react";
import PrimaryButton from "@/components/buttons/PrimaryButton";
import {
  findAllProductionsByOwner,
  getProductionConsumption,
} from "@/app/server/productionActions";
import { isProductionActionError } from "@/utils/functions/productionErrorHandler";
import {
  ProductionConsumption,
  ProductionOwnerType,
  ProductionResponse,
} from "@/types/productionTypes";
import { CREATE_PRODUCTION } from "@/utils/data/urls";
import ProductionListCard from "../../../producciones/components/ProductionListCard";
import CredentialCard from "../../../producciones/components/CredentialCard";

interface Props {
  userId: string;
  isMyProfile: boolean;
  credentialId?: string | null;
  displayName?: string;
}

const tokenSourceLabel: Record<string, string> = {
  plan: "Plan",
  free: "Gratuito",
  anonymous: "Anónimo",
};

/**
 * Contenido de la solapa "Producciones" del cartel (Panel de Control, Fase 4).
 * Componente cliente: `UserSolapas` renderiza las solapas inline.
 */
const ProfileProductionsTab = ({
  userId,
  isMyProfile,
  credentialId,
  displayName,
}: Props) => {
  const [loading, setLoading] = useState(true);
  const [productions, setProductions] = useState<ProductionResponse[]>([]);
  const [consumption, setConsumption] =
    useState<ProductionConsumption | null>(null);

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
      if (isMyProfile) {
        const cons = await getProductionConsumption();
        if (active && !isProductionActionError(cons)) {
          setConsumption(cons);
        }
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
      {isMyProfile && (
        <div className="flex flex-col md:flex-row gap-4 items-start">
          <CredentialCard
            userId={userId}
            credentialId={credentialId}
            displayName={displayName}
          />
          {consumption && (
            <section className="flex-1 w-full flex flex-col gap-3">
              <h3 className="text-lg font-semibold">CONTROL Consumo</h3>
              {consumption.tokens && (
                <Card shadow="sm">
                  <CardBody className="gap-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">
                        Tokens de IA (
                        {tokenSourceLabel[consumption.tokens.source] ??
                          consumption.tokens.source}
                        )
                      </span>
                      <span className="text-default-500">
                        {consumption.tokens.used} /{" "}
                        {consumption.tokens.allowance}
                      </span>
                    </div>
                    <Progress
                      aria-label="Tokens usados"
                      value={consumption.tokens.used}
                      maxValue={consumption.tokens.allowance || 1}
                      color="secondary"
                      size="sm"
                    />
                  </CardBody>
                </Card>
              )}
              {consumption.blogs.map((blog) => (
                <Card key={blog.productionId} shadow="sm">
                  <CardBody className="gap-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium truncate">
                        {blog.title}
                      </span>
                      <span className="text-default-500">
                        {blog.filesCount} / {blog.filesPerBlogLimit}
                      </span>
                    </div>
                    <Progress
                      aria-label={`Archivos de ${blog.title}`}
                      value={blog.filesCount}
                      maxValue={blog.filesPerBlogLimit || 1}
                      color={blog.filesAvailable > 0 ? "primary" : "danger"}
                      size="sm"
                    />
                  </CardBody>
                </Card>
              ))}
            </section>
          )}
        </div>
      )}

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
