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
  ];

  return <BreadcrumbsAdmin items={breadcrumbsItems} />;
}
