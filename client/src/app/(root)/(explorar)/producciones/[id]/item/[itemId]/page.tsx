import {
  findProduction,
  getProductionItemById,
  getProductionItems,
} from "@/app/server/productionActions";
import { isProductionActionError } from "@/utils/functions/productionErrorHandler";
import ErrorCard from "@/components/ErrorCard";
import BreadcrumbsAdmin from "@/components/BreadcrumbsAdmin";
import { PRODUCTIONS } from "@/utils/data/urls";
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

  const blogHref = `${PRODUCTIONS}/${params.id}`;
  const blogTitle = isProductionActionError(production)
    ? "Blog"
    : production.title;

  // Breadcrumb completo: Inicio › Producciones › <blog> › <carpetas…> › <ítem>.
  // Los primeros niveles navegan; las carpetas no tienen URL propia, así que
  // apuntan a la raíz del blog (la navegación por carpetas es estado interno).
  const breadcrumbsItems: { label: string; href: string }[] = [
    { label: "Inicio", href: "/" },
    { label: "Producciones", href: PRODUCTIONS },
    { label: blogTitle, href: blogHref },
  ];
  if (!isProductionActionError(item)) {
    if (item.parent) {
      const level = await getProductionItems(params.id, item.parent);
      if (!isProductionActionError(level)) {
        level.breadcrumb.forEach((crumb) =>
          breadcrumbsItems.push({ label: crumb.name, href: blogHref })
        );
      }
    }
    breadcrumbsItems.push({ label: item.name, href: "#" });
  }

  return (
    <main className="flex min-h-screen flex-col items-start main-style gap-4 md:gap-6 lg:gap-8">
      <BreadcrumbsAdmin items={breadcrumbsItems} />
      {isProductionActionError(item) ? (
        <ErrorCard message={item.error} />
      ) : (
        <ProductionItemDetail item={item} canEdit={canEdit} />
      )}
    </main>
  );
}
