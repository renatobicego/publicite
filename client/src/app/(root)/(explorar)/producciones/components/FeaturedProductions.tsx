import { findFeaturedProductions } from "@/app/server/productionActions";
import { isProductionActionError } from "@/utils/functions/productionErrorHandler";
import ProductionListCard from "./ProductionListCard";
import ViewMoreProductionsButton from "./ViewMoreProductionsButton";

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
      <h2>Producciones destacadas</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {featured.map((production) => (
          <ProductionListCard key={production._id} production={production} />
        ))}
      </div>
      <ViewMoreProductionsButton />
    </section>
  );
};

export default FeaturedProductions;
