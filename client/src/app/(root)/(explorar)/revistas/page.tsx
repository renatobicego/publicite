import BreadcrumbsAdmin from "@/components/BreadcrumbsAdmin";
import SolapasTabs from "@/components/solapas/SolapasTabs";
import { MAGAZINES } from "@/utils/data/urls";
export const metadata = {
  title: "Revistas - Publicité",
  description: "Explora tus revistas de Publicité.",
};
export default async function Magazines() {
  const breadcrumbsItems = [
    {
      label: "Inicio",
      href: "/",
    },
    {
      label: "Revistas",
      href: MAGAZINES,
    },
  ];

  return (
    <main className="flex min-h-screen flex-col items-start main-style gap-4">
      <BreadcrumbsAdmin items={breadcrumbsItems} />
      <SolapasTabs />
    </main>
  );
}
