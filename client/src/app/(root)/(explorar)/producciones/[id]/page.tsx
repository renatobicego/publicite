import { getProductionItems } from "@/app/server/productionActions";
import { isProductionActionError } from "@/utils/functions/productionErrorHandler";
import ErrorCard from "@/components/ErrorCard";
import BreadcrumbsAdmin from "@/components/BreadcrumbsAdmin";
import { PRODUCTIONS } from "@/utils/data/urls";
import ProductionBlog from "./components/ProductionBlog";
import {
  FOLDER_PARAM,
  PREVIEW_PARAM,
  PREVIEW_VALUE,
} from "../productionBrowse";

export default async function ProductionPage(
  props: {
    params: Promise<{ id: string }>;
    searchParams: Promise<Record<string, string | string[] | undefined>>;
  }
) {
  const params = await props.params;
  const searchParams = await props.searchParams;
  const folderParam = searchParams[FOLDER_PARAM];
  let folderId = typeof folderParam === "string" ? folderParam : undefined;

  let result = await getProductionItems(params.id, folderId);
  // La carpeta de la URL pudo haberse borrado o movido: se abre la raíz.
  if (folderId && isProductionActionError(result)) {
    folderId = undefined;
    result = await getProductionItems(params.id);
  }

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
        <ProductionBlog
          initial={result}
          initialParentId={folderId}
          initialPreview={searchParams[PREVIEW_PARAM] === PREVIEW_VALUE}
        />
      )}
    </main>
  );
}
