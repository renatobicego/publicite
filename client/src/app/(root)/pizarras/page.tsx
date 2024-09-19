import BreadcrumbsAdmin from "@/app/components/BreadcrumbsAdmin";
import SolapasTabs from "@/app/components/SolapasTabs";
import { BOARDS } from "@/app/utils/data/urls";



export default async function Boards() {

  const breadcrumbsItems = [
    {
      label: "Inicio",
      href: "/",
    },
    {
      label: "Pizarras",
      href: BOARDS,
    }
  ];

  return (
    <main className="flex min-h-screen flex-col items-start main-style gap-4">
      <BreadcrumbsAdmin items={breadcrumbsItems} />
      <SolapasTabs />
    </main>
  );
}
