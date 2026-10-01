import BreadcrumbsAdmin from "@/components/BreadcrumbsAdmin";
import SolapasTabs from "@/components/solapas/SolapasTabs";
import { PRODUCTIONS } from "@/utils/data/urls";

export const metadata = {
  title: "Producciones - Publicité",
  description: "Explora las producciones de Publicité.",
};

export default async function ProductionsPage() {
  const breadcrumbsItems = [
    {
      label: "Inicio",
      href: "/",
    },
    {
      label: "Producciones",
      href: PRODUCTIONS,
    },
  ];
  return (
    <main className="flex min-h-screen flex-col items-start main-style gap-4">
      <BreadcrumbsAdmin items={breadcrumbsItems} />
      <SolapasTabs />
    </main>
  );
}
