import BreadcrumbsAdmin from "@/components/BreadcrumbsAdmin";
import { CREATE, CREATE_GROUP } from "@/utils/data/urls";
import CreateGroupForm from "./CreateGroupForm";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

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
  const user = await currentUser();
  if (!user) {
    return redirect("/iniciar-sesion")
  }
  return (
    <main className="flex min-h-screen flex-col items-start main-style gap-4 md:gap-6 lg:gap-8">
      <BreadcrumbsAdmin items={breadcrumbsItems} />
      <CreateGroupForm username={user?.username} />
    </main>
  );
}
