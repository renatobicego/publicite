import BreadcrumbsAdmin from "@/app/components/BreadcrumbsAdmin";
import { CREATE, CREATE_PETITION, CREATE_POST } from "@/app/utils/urls";
import CreatePetition from "./CreatePetition";

export default function CreatePost() {
  const breadcrumbsItems = [
    {
      label: "Inicio",
      href: "/",
    },
    {
      label: "Crear",
      href: CREATE,
    },
    {
      label: "Necesidad",
      href: CREATE_PETITION,
    },
  ];
  return (
    <main className="flex min-h-screen flex-col items-start main-style gap-4 md:gap-6 lg:gap-8">
      <BreadcrumbsAdmin items={breadcrumbsItems} />
      <h2>Crear Necesidad</h2>
      <CreatePetition />
    </main>
  );
}
