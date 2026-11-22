"use client";
import { Link, Spinner } from "@nextui-org/react";
import { useAdAgentProfile } from "@/utils/hooks/useAdAgentProfile";
import { adAgentTaxLabel } from "@/utils/data/adSpaces";

/** Sitio web e impuestos de la cuenta Empresa / Agente que publica el espacio. */
const AdAgentData = ({ authorId }: { authorId: string }) => {
  const { profile, loading } = useAdAgentProfile(authorId);
  if (loading) return <Spinner color="warning" size="sm" />;
  if (!profile) {
    return (
      <p className="text-sm text-light-text">
        No hay datos fiscales del anunciante.
      </p>
    );
  }
  return (
    <div className="flex flex-col gap-2 text-sm">
      {profile.businessName && (
        <p className="font-semibold">{profile.businessName}</p>
      )}
      <p>
        <span className="text-light-text">Sitio web oficial: </span>
        <Link href={profile.website} isExternal showAnchorIcon size="sm">
          {profile.website}
        </Link>
      </p>
      {profile.countryRegion && (
        <p>
          <span className="text-light-text">Localización: </span>
          {profile.countryRegion}
        </p>
      )}
      <p>
        <span className="text-light-text">Condición frente al IVA: </span>
        {adAgentTaxLabel(profile.taxCondition)}
      </p>
      <p className="whitespace-pre-line">{profile.taxNote}</p>
    </div>
  );
};

export default AdAgentData;
