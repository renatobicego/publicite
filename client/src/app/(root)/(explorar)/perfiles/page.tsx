import BreadcrumbsAdmin from "@/components/BreadcrumbsAdmin";
import { PROFILE } from "@/utils/data/urls";

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

  return <BreadcrumbsAdmin items={breadcrumbsItems} />;
}
