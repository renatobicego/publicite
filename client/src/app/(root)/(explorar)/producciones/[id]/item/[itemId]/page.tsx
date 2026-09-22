import {
  findProduction,
  getProductionItemById,
} from "@/app/server/productionActions";
import { isProductionActionError } from "@/utils/functions/productionErrorHandler";
import ErrorCard from "@/components/ErrorCard";
import ProductionItemDetail from "./components/ProductionItemDetail";

export default async function ProductionItemPage({
  params,
}: {
  params: { id: string; itemId: string };
}) {
  const [item, production] = await Promise.all([
    getProductionItemById(params.itemId),
    findProduction(params.id),
  ]);

  // Sólo staff (canEdit) ve los controles de edición/borrado en el detalle.
  const canEdit =
    !isProductionActionError(production) && !!production.viewer?.canEdit;

  return (
    <main className="flex min-h-screen flex-col items-start main-style gap-4 md:gap-6 lg:gap-8">
      {isProductionActionError(item) ? (
        <ErrorCard message={item.error} />
      ) : (
        <ProductionItemDetail item={item} canEdit={canEdit} />
      )}
    </main>
  );
}
