import BreadcrumbsAdmin from "@/app/components/BreadcrumbsAdmin";
import { CREATE, CREATE_POST } from "@/app/utils/data/urls";
import CreateForm from "./components/CreateForm/CreateForm";

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
      label: "Anuncio",
      href: CREATE_POST,
    },
  ];
  return (
    <main className="flex min-h-screen flex-col items-start main-style gap-4 md:gap-6 lg:gap-8">
      <BreadcrumbsAdmin items={breadcrumbsItems} />
      <h2>Crear Anuncio</h2>
      <CreateForm />
    </main>
  );
}
