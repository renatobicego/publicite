import Link from "next/link";
import { findFeaturedProductions } from "@/app/server/productionActions";
import { isProductionActionError } from "@/utils/functions/productionErrorHandler";
import { PRODUCTIONS } from "@/utils/data/urls";
import ProductionListCard from "./ProductionListCard";
import SecondaryButton from "@/components/buttons/SecondaryButton";

/**
 * Sección "Producciones destacadas" del home (NAV-03).
 * Si no hay destacadas (o hay error), no renderiza nada.
 */
const FeaturedProductions = async ({ limit = 8 }: { limit?: number }) => {
  const featured = await findFeaturedProductions(limit);

  if (isProductionActionError(featured) || featured.length === 0) {
    return null;
  }

  return (
    <section className="w-full flex flex-col gap-3">
      <h3 className="text-lg font-semibold">Producciones destacadas</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {featured.map((production) => (
          <ProductionListCard key={production._id} production={production} />
        ))}
      </div>
      <SecondaryButton as={Link} href={PRODUCTIONS} className="self-center mt-4">
        Ver Más Producciones
      </SecondaryButton>
    </section>
  );
};

export default FeaturedProductions;
