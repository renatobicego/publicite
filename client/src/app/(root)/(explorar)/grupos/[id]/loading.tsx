import BreadcrumbsAdmin from "@/components/BreadcrumbsAdmin";
import { Skeleton } from "@nextui-org/react";

export default function Loading() {
  const breadcrumbsItems = [
    { label: "Inicio", href: "/" },
    { label: "Grupos", href: "/groups" },
    { label: "Cargando...", href: "#" },
  ];

  return (
    <main className="flex min-h-screen flex-col items-start main-style gap-4 md:gap-6 xl:gap-8">
      <BreadcrumbsAdmin items={breadcrumbsItems} />
      <Skeleton className="w-full h-40 rounded-lg" />
      <Skeleton className="w-full h-20 rounded-lg" />
      <Skeleton className="w-full h-96 rounded-lg" />
    </main>
  );
}
