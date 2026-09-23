import Link from "next/link";
import { FaArrowLeft, FaRegFileAlt } from "react-icons/fa";
import { findProduction } from "@/app/server/productionActions";
import { isProductionActionError } from "@/utils/functions/productionErrorHandler";
import ErrorCard from "@/components/ErrorCard";
import { PRODUCTIONS } from "@/utils/data/urls";
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
    <main className="flex min-h-screen flex-col items-start main-style gap-6 w-full max-w-screen-md py-8">
      <div className="w-full">
        <Link
          href={`${PRODUCTIONS}/${params.id}`}
          className="mb-3 inline-flex items-center gap-1.5 text-sm text-default-500 transition-colors hover:text-primary"
        >
          <FaArrowLeft size={12} />
          Volver al blog
        </Link>
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <FaRegFileAlt size={18} />
          </span>
          <div>
            <h1 className="text-2xl font-semibold leading-tight md:text-3xl">
              Nuevo artículo
            </h1>
            <p className="text-sm text-default-500">{production.title}</p>
          </div>
        </div>
      </div>
      <CreateArticleForm
        productionId={params.id}
        parentId={searchParams.parentId}
      />
    </main>
  );
}
