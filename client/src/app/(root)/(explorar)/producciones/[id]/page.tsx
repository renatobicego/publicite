import { getProductionItems } from "@/app/server/productionActions";
import { isProductionActionError } from "@/utils/functions/productionErrorHandler";
import ErrorCard from "@/components/ErrorCard";
import BreadcrumbsAdmin from "@/components/BreadcrumbsAdmin";
import { PRODUCTIONS } from "@/utils/data/urls";
import ProductionBlog from "./components/ProductionBlog";

export default async function ProductionPage({
  params,
}: {
  params: { id: string };
}) {
  const result = await getProductionItems(params.id);

  const breadcrumbsItems = [
    { label: "Inicio", href: "/" },
    { label: "Producciones", href: PRODUCTIONS },
    ...(isProductionActionError(result)
      ? []
      : [
        {
          label: result.production.title,
          href: `${PRODUCTIONS}/${params.id}`,
        },
      ]),
  ];

  return (
    <main className="flex min-h-screen flex-col items-start main-style gap-4 md:gap-6 lg:gap-8">
      <BreadcrumbsAdmin items={breadcrumbsItems} />
      {isProductionActionError(result) ? (
        <ErrorCard message={result.error} />
      ) : (
        <ProductionBlog initial={result} />
      )}
    </main>
  );
}
