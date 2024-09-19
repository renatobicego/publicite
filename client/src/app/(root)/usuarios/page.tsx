import BreadcrumbsAdmin from "@/app/components/BreadcrumbsAdmin";
import SolapasTabs from "@/app/components/SolapasTabs";

import { POSTS } from "@/app/utils/data/urls";


export default async function UsersList() {

  const breadcrumbsItems = [
    {
      label: "Inicio",
      href: "/",
    },
    {
      label: "Anuncios",
      href: POSTS,
    }
  ];

  return (
    <main className="flex min-h-screen flex-col items-start main-style gap-6 md:gap-8">
      <BreadcrumbsAdmin items={breadcrumbsItems} />
      <SolapasTabs />
    </main>
  );
}
