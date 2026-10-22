import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import BreadcrumbsAdmin from "@/components/BreadcrumbsAdmin";
import ErrorCard from "@/components/ErrorCard";
import { findProduction } from "@/app/server/productionActions";
import { isProductionActionError } from "@/utils/functions/productionErrorHandler";
import { EDIT_PRODUCTION, PRODUCTIONS } from "@/utils/data/urls";
import { ProductionOwnerType } from "@/types/productionTypes";
import EditProductionBehaviour from "./EditProductionBehaviour";

/** Cambiar un blog personal entre libre y agenda (como en Anuncios). */
export default async function EditProductionBehaviourPage(props: {
  params: Promise<{ id: string }>;
}) {
  const params = await props.params;
  const user = await auth();
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
  if (!production.viewer?.canManageAccess) {
    redirect(`${PRODUCTIONS}/${production._id}`);
  }
  if (production.ownerType === ProductionOwnerType.Group) {
    return (
      <main className="flex min-h-screen flex-col items-start main-style gap-4">
        <ErrorCard message="Los blogs de grupo no tienen comportamiento libre o agenda." />
      </main>
    );
  }

  const breadcrumbsItems = [
    { label: "Inicio", href: "/" },
    { label: "Producciones", href: PRODUCTIONS },
    { label: production.title, href: `${PRODUCTIONS}/${production._id}` },
    {
      label: "Editar Comportamiento",
      href: `${EDIT_PRODUCTION}/${production._id}/comportamiento`,
    },
  ];

  return (
    <main className="flex min-h-screen flex-col items-start main-style gap-4 md:gap-6 lg:gap-8">
      <BreadcrumbsAdmin items={breadcrumbsItems} />
      <h2>Editar Comportamiento del Blog</h2>
      <EditProductionBehaviour production={production} />
    </main>
  );
}
