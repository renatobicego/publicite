import BreadcrumbsAdmin from "@/components/BreadcrumbsAdmin";
import { BOARDS } from "@/utils/data/urls";

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

  return <BreadcrumbsAdmin items={breadcrumbsItems} />;
}
