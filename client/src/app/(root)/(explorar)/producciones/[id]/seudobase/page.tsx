import { findProduction } from "@/app/server/productionActions";
import { isProductionActionError } from "@/utils/functions/productionErrorHandler";
import ErrorCard from "@/components/ErrorCard";
import SeudoBaseTable from "./components/SeudoBaseTable";

/** SeudoBase (Fase 7): tabla de gestión masiva del blog. Sólo staff. */
export default async function SeudoBasePage({
  params,
}: {
  params: { id: string };
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
        <ErrorCard message="No tenés permiso para gestionar este blog." />
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-start main-style gap-4 md:gap-6 lg:gap-8">
      <h2>SeudoBase · {production.title}</h2>
      <SeudoBaseTable productionId={params.id} />
    </main>
  );
}
