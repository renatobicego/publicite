import Link from "next/link";
import { findAllProductions } from "@/app/server/productionActions";
import { isProductionActionError } from "@/utils/functions/productionErrorHandler";
import ErrorCard from "@/components/ErrorCard";
import PrimaryButton from "@/components/buttons/PrimaryButton";
import { CREATE_PRODUCTION } from "@/utils/data/urls";
import ProductionListCard from "./components/ProductionListCard";

export default async function ProductionsPage({
  searchParams,
}: {
  searchParams: { q?: string; busqueda?: string };
}) {
  const searchTerm = searchParams.busqueda ?? searchParams.q;
  const result = await findAllProductions(1, 20, searchTerm);

  return (
    <main className="flex min-h-screen flex-col items-start main-style gap-4 md:gap-6 lg:gap-8">
      <div className="w-full flex items-center justify-between gap-4 flex-wrap">
        <h2>Producciones</h2>
        <PrimaryButton as={Link} href={CREATE_PRODUCTION}>
          Crear producción
        </PrimaryButton>
      </div>

      {isProductionActionError(result) ? (
        <ErrorCard message={result.error} />
      ) : result.productions.length === 0 ? (
        <p className="text-sm text-default-500">
          Todavía no hay producciones para mostrar.
        </p>
      ) : (
        <div className="w-full grid grid-cols-2 gap-3 md:gap-4 md:grid-cols-3 xl:grid-cols-4 3xl:grid-cols-5 lg:gap-5 items-start">
          {result.productions.map((production) => (
            <ProductionListCard
              key={production._id}
              production={production}
            />
          ))}
        </div>
      )}
    </main>
  );
}
