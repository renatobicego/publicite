import BreadcrumbsAdmin from "@/components/BreadcrumbsAdmin";
import SolapasTabs from "@/components/solapas/SolapasTabs";
import { GROUPS } from "@/utils/data/urls";

export const metadata = {
  title: "Grupos - Publicité",
  description: "Explora los grupos de Publicité.",
};
export default async function GroupsList() {
  const breadcrumbsItems = [
    {
      label: "Inicio",
      href: "/",
    },
    {
      label: "Grupos",
      href: GROUPS,
    },
  ];

  return (
    <main className="flex min-h-screen flex-col items-start main-style gap-4">
      <BreadcrumbsAdmin items={breadcrumbsItems} />
      <SolapasTabs />
    </main>
  );
}
