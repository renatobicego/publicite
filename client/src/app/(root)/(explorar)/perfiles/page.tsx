import BreadcrumbsAdmin from "@/components/BreadcrumbsAdmin";
import SolapasTabs from "@/components/solapas/SolapasTabs";
import { PROFILE } from "@/utils/data/urls";
export const metadata = {
  title: "Perfiles - Publicité",
  description: "Explora los perfiles de Publicité.",
};
export default async function UsersList() {
  const breadcrumbsItems = [
    {
      label: "Inicio",
      href: "/",
    },
    {
      label: "Perfiles",
      href: PROFILE,
    },
  ];

  return (
    <main className="flex min-h-screen flex-col items-start main-style gap-4">
      <BreadcrumbsAdmin items={breadcrumbsItems} />
      <SolapasTabs />
    </main>
  );
}
