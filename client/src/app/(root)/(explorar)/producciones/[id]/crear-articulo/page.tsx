import { findProduction } from "@/app/server/productionActions";
import { isProductionActionError } from "@/utils/functions/productionErrorHandler";
import ErrorCard from "@/components/ErrorCard";
import CreateArticleForm from "./components/CreateArticleForm";

/**
 * Alta de un artículo de blog en una página propia (antes era un modal).
 * `parentId` (opcional) llega por query string cuando el artículo se crea
 * dentro de una carpeta. Sólo staff (`canEdit`).
 */
export default async function CreateArticlePage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { parentId?: string };
}) {
  const production = await findProduction(params.id);

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
        <ErrorCard message="No tenés permiso para crear artículos en este blog." />
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-start main-style gap-6 md:gap-8 max-w-screen-lg py-8">
      <h1 className="text-3xl md:text-[2.5rem] xl:text-5xl font-semibold">
        Nuevo artículo · {production.title}
      </h1>
      <CreateArticleForm
        productionId={params.id}
        parentId={searchParams.parentId}
      />
    </main>
  );
}
