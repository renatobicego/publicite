import BreadcrumbsAdmin from "@/components/BreadcrumbsAdmin";
import SolapasTabs from "@/components/solapas/SolapasTabs";
import { POSTS } from "@/utils/data/urls";

export default async function PostsList() {
  const breadcrumbsItems = [
    {
      label: "Inicio",
      href: "/",
    },
    {
      label: "Anuncios",
      href: POSTS,
    },
    {
      label: "Necesidades",
      href: `${POSTS}/necesidades`,
    },
  ];

  return (
    <main className="flex min-h-screen flex-col items-start main-style gap-4">
      <BreadcrumbsAdmin items={breadcrumbsItems} />
      <SolapasTabs />
    </main>
  );
}
