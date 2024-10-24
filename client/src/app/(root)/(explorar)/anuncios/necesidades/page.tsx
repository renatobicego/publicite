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
      label: "Necesidades",
      href: `${POSTS}/necesidades`,
    },
  ];

  return <BreadcrumbsAdmin items={breadcrumbsItems} />
}
