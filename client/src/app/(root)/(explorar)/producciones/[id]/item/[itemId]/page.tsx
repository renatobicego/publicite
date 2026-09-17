import { getProductionItemById } from "@/app/server/productionActions";
import { isProductionActionError } from "@/utils/functions/productionErrorHandler";
import ErrorCard from "@/components/ErrorCard";
import ProductionItemDetail from "./components/ProductionItemDetail";

export default async function ProductionItemPage({
  params,
}: {
  params: { id: string; itemId: string };
}) {
  const item = await getProductionItemById(params.itemId);

  return (
    <main className="flex min-h-screen flex-col items-start main-style gap-4 md:gap-6 lg:gap-8">
      {isProductionActionError(item) ? (
        <ErrorCard message={item.error} />
      ) : (
        <ProductionItemDetail item={item} />
      )}
    </main>
  );
}
