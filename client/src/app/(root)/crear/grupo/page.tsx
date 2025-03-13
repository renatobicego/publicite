import BreadcrumbsAdmin from "@/components/BreadcrumbsAdmin";
import { CREATE, CREATE_GROUP } from "@/utils/data/urls";
import CreateGroupForm from "./CreateGroupForm";

export default async function CreateGroupPage() {
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
      label: "Grupo",
      href: CREATE_GROUP,
    },
  ];

  return (
    <main
      id="create-group"
      className="flex min-h-screen flex-col items-start main-style gap-4 md:gap-6 lg:gap-8"
    >
      <BreadcrumbsAdmin items={breadcrumbsItems} />
      <CreateGroupForm />
    </main>
  );
}
