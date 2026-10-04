import Link from "next/link";
import { FaArrowLeft, FaRegFileAlt } from "react-icons/fa";
import {
  findProduction,
  getProductionItemById,
} from "@/app/server/productionActions";
import { isProductionActionError } from "@/utils/functions/productionErrorHandler";
import ErrorCard from "@/components/ErrorCard";
import { ProductionItemKind } from "@/types/productionTypes";
import { PRODUCTIONS } from "@/utils/data/urls";
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
    <main className="flex min-h-screen flex-col items-start main-style gap-6 w-full max-w-screen-md py-8">
      <div className="w-full">
        <Link
          href={`${PRODUCTIONS}/${params.id}/item/${params.itemId}`}
          className="mb-3 inline-flex items-center gap-1.5 text-sm text-default-500 transition-colors hover:text-primary"
        >
          <FaArrowLeft size={12} />
          Volver al artículo
        </Link>
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <FaRegFileAlt size={18} />
          </span>
          <div>
            <h1 className="text-2xl font-semibold leading-tight md:text-3xl">
              Editar artículo
            </h1>
            <p className="text-sm text-default-500">{production.title}</p>
          </div>
        </div>
      </div>
      <EditArticleForm item={item} />
    </main>
  );
}
