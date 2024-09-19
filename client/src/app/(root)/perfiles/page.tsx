import BreadcrumbsAdmin from "@/app/components/BreadcrumbsAdmin";
import SolapasTabs from "@/app/components/SolapasTabs";

import { PROFILE } from "@/app/utils/data/urls";


export default async function UsersList() {

  const breadcrumbsItems = [
    {
      label: "Inicio",
      href: "/",
    },
    {
      label: "Perfiles",
      href: PROFILE,
    }
  ];

  return (
    <main className="flex min-h-screen flex-col items-start main-style gap-4">
      <BreadcrumbsAdmin items={breadcrumbsItems} />
      <SolapasTabs />
    </main>
  );
}
