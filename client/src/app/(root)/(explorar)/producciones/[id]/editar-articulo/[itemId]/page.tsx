import {
  findProduction,
  getProductionItemById,
} from "@/app/server/productionActions";
import { isProductionActionError } from "@/utils/functions/productionErrorHandler";
import ErrorCard from "@/components/ErrorCard";
import { ProductionItemKind } from "@/types/productionTypes";
import EditArticleForm from "../components/EditArticleForm";

/**
 * Edición de un artículo de blog en página propia (mismo patrón que
 * `crear-articulo`). Sólo staff (`canEdit`). Se verifica que el ítem sea un
 * artículo antes de mostrar el editor.
 */
export default async function EditArticlePage({
  params,
}: {
  params: { id: string; itemId: string };
}) {
  const [production, item] = await Promise.all([
    findProduction(params.id),
    getProductionItemById(params.itemId),
  ]);

  if (isProductionActionError(production)) {
    return (
      <main className="flex min-h-screen flex-col items-start main-style gap-4">
        <ErrorCard message={production.error} />
      </main>
    );
  }

  if (!production.viewer?.canEdit) {
    return (
      <main className="flex min-h-screen flex-col items-start main-style gap-4">
        <ErrorCard message="No tenés permiso para editar artículos en este blog." />
      </main>
    );
  }

  if (isProductionActionError(item)) {
    return (
      <main className="flex min-h-screen flex-col items-start main-style gap-4">
        <ErrorCard message={item.error} />
      </main>
    );
  }

  if (item.kind !== ProductionItemKind.article) {
    return (
      <main className="flex min-h-screen flex-col items-start main-style gap-4">
        <ErrorCard message="Este ítem no es un artículo." />
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-start main-style gap-6 md:gap-8 max-w-screen-lg py-8">
      <h1 className="text-3xl md:text-[2.5rem] xl:text-5xl font-semibold">
        Editar artículo · {production.title}
      </h1>
      <EditArticleForm item={item} />
    </main>
  );
}
