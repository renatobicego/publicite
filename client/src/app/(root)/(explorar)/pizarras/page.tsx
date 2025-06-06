import BreadcrumbsAdmin from "@/components/BreadcrumbsAdmin";
import SolapasTabs from "@/components/solapas/SolapasTabs";
import { BOARDS } from "@/utils/data/urls";
export const metadata = {
  title: "Pizarras - Publicité",
  description: "Explora las pizarras de usuarios de Publicité.",
};
export default async function Boards() {
  const breadcrumbsItems = [
    {
      label: "Inicio",
      href: "/",
    },
    {
      label: "Pizarras",
      href: BOARDS,
    },
  ];

  return (
    <main className="flex min-h-screen flex-col items-start main-style gap-4">
      <BreadcrumbsAdmin items={breadcrumbsItems} />
      <SolapasTabs />
    </main>
  );
}
