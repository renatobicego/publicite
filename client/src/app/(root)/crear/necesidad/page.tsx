import BreadcrumbsAdmin from "@/components/BreadcrumbsAdmin";
import { CREATE, CREATE_PETITION } from "@/utils/data/urls";
import CreatePetitionClient from "./CreatePetitionClient";
import { auth } from "@clerk/nextjs/server";

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
  const user = auth();
  const userId = user.sessionClaims?.metadata.mongoId;
  return (
    <main
      id="create-need"
      className="flex min-h-screen flex-col items-start main-style gap-4 md:gap-6 lg:gap-8"
    >
      <BreadcrumbsAdmin items={breadcrumbsItems} />
      <h2>Crear Necesidad</h2>
      <CreatePetitionClient userId={userId} />
    </main>
  );
}
