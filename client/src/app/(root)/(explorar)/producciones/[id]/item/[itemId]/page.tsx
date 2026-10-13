import {
  findProduction,
  getProductionItemById,
  getProductionItems,
} from "@/app/server/productionActions";
import { isProductionActionError } from "@/utils/functions/productionErrorHandler";
import ErrorCard from "@/components/ErrorCard";
import BreadcrumbsAdmin from "@/components/BreadcrumbsAdmin";
import { PRODUCTIONS } from "@/utils/data/urls";
import { ProductionItemKind } from "@/types/productionTypes";
import ProductionItemDetail from "./components/ProductionItemDetail";
import ProductionItemNav from "./components/ProductionItemNav";
import {
  FOLDER_PARAM,
  PREVIEW_PARAM,
  PREVIEW_VALUE,
} from "../../../productionBrowse";

export default async function ProductionItemPage(
  props: {
    params: Promise<{ id: string; itemId: string }>;
    searchParams: Promise<Record<string, string | string[] | undefined>>;
  }
) {
  const params = await props.params;
  const searchParams = await props.searchParams;
  const [item, production] = await Promise.all([
    getProductionItemById(params.itemId),
    findProduction(params.id),
  ]);

  // Sólo staff (canEdit) ve los controles de edición/borrado en el detalle;
  // en vista previa de visitante (`?vista=visitante`) se le ocultan.
  const isStaff =
    !isProductionActionError(production) && !!production.viewer?.canEdit;
  const previewMode = isStaff && searchParams[PREVIEW_PARAM] === PREVIEW_VALUE;
  const previewQuery = previewMode ? `${PREVIEW_PARAM}=${PREVIEW_VALUE}` : "";
  const withPreview = (href: string) =>
    previewQuery
      ? `${href}${href.includes("?") ? "&" : "?"}${previewQuery}`
      : href;

  const blogHref = `${PRODUCTIONS}/${params.id}`;
  const blogTitle = isProductionActionError(production)
    ? "Blog"
    : production.title;
  const folderHref = (folderId?: string | null) =>
    withPreview(folderId ? `${blogHref}?${FOLDER_PARAM}=${folderId}` : blogHref);

  // Breadcrumb completo: Inicio › Producciones › <blog> › <carpetas…> › <ítem>.
  // Cada carpeta abre el blog en ese nivel (`?carpeta=`).
  const breadcrumbsItems: { label: string; href: string }[] = [
    { label: "Inicio", href: "/" },
    { label: "Producciones", href: PRODUCTIONS },
    { label: blogTitle, href: withPreview(blogHref) },
  ];

  // Vecinos del ítem en su carpeta, para las flechas Anterior / Siguiente.
  let previousHref: string | undefined;
  let nextHref: string | undefined;
  let position: { current: number; total: number } | undefined;
  let backLabel = blogTitle;

  if (!isProductionActionError(item)) {
    const level = await getProductionItems(params.id, item.parent ?? undefined);
    if (!isProductionActionError(level)) {
      level.breadcrumb.forEach((crumb) =>
        breadcrumbsItems.push({
          label: crumb.name,
          href: folderHref(crumb._id),
        })
      );
      backLabel = level.breadcrumb.at(-1)?.name ?? blogTitle;

      const siblings = level.items.filter(
        (sibling) => sibling.kind !== ProductionItemKind.folder
      );
      const index = siblings.findIndex((sibling) => sibling._id === item._id);
      if (index >= 0) {
        const itemHref = (id: string) =>
          withPreview(`${blogHref}/item/${id}`);
        if (index > 0) previousHref = itemHref(siblings[index - 1]._id);
        if (index < siblings.length - 1) {
          nextHref = itemHref(siblings[index + 1]._id);
        }
        position = { current: index + 1, total: siblings.length };
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
        <>
          <ProductionItemNav
            backHref={folderHref(item.parent)}
            backLabel={backLabel}
            previousHref={previousHref}
            nextHref={nextHref}
            position={position}
            isStaff={isStaff}
            previewMode={previewMode}
            itemHref={`${blogHref}/item/${item._id}`}
            previewHref={`${blogHref}/item/${item._id}?${PREVIEW_PARAM}=${PREVIEW_VALUE}`}
          />
          <ProductionItemDetail item={item} canEdit={isStaff && !previewMode} />
        </>
      )}
    </main>
  );
}
