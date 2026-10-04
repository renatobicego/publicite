import BreadcrumbsAdmin from "@/components/BreadcrumbsAdmin";
import { CREATE, CREATE_PRODUCTION } from "@/utils/data/urls";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import CreateProductionForm from "./components/CreateProductionForm";

export default function CreateProductionPage({
  searchParams,
}: {
  searchParams: { groupId?: string };
}) {
  const user = auth();
  if (!user.userId) {
    redirect("/iniciar-sesion");
  }

  const breadcrumbsItems = [
    { label: "Inicio", href: "/" },
    { label: "Crear", href: CREATE },
    { label: "Producción", href: CREATE_PRODUCTION },
  ];

  return (
    <main className="flex min-h-screen flex-col items-start main-style gap-4 md:gap-6 lg:gap-8">
      <BreadcrumbsAdmin items={breadcrumbsItems} />
      <h2>Crear Producción</h2>
      <CreateProductionForm groupId={searchParams.groupId} />
    </main>
  );
}
