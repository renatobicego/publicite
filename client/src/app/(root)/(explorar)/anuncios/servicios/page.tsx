import BreadcrumbsAdmin from "@/components/BreadcrumbsAdmin";
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
      label: "Servicios",
      href: `${POSTS}/servicios`,
    },
  ];

  return (
      <BreadcrumbsAdmin items={breadcrumbsItems} />
  );
}
