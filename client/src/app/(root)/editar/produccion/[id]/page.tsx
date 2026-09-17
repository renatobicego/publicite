import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import BreadcrumbsAdmin from "@/components/BreadcrumbsAdmin";
import ErrorCard from "@/components/ErrorCard";
import { findProduction } from "@/app/server/productionActions";
import { isProductionActionError } from "@/utils/functions/productionErrorHandler";
import { PRODUCTIONS } from "@/utils/data/urls";
import EditProductionForm from "./components/EditProductionForm";

export default async function EditProductionPage({
  params,
}: {
  params: { id: string };
}) {
  const user = auth();
  if (!user.userId) {
    redirect("/iniciar-sesion");
  }

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
        <ErrorCard message="No tenés permiso para editar este blog." />
      </main>
    );
  }

  const breadcrumbsItems = [
    { label: "Inicio", href: "/" },
    { label: "Producciones", href: PRODUCTIONS },
    { label: production.title, href: `${PRODUCTIONS}/${production._id}` },
    { label: "Editar", href: "#" },
  ];

  return (
    <main className="flex min-h-screen flex-col items-start main-style gap-4 md:gap-6 lg:gap-8">
      <BreadcrumbsAdmin items={breadcrumbsItems} />
      <h2>Editar Producción</h2>
      <EditProductionForm production={production} />
    </main>
  );
}
