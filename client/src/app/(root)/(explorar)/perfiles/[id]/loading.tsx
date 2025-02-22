import BreadcrumbsAdmin from "@/components/BreadcrumbsAdmin";
import { Skeleton } from "@nextui-org/react";

export default function Loading() {
  const breadcrumbsItems = [
    { label: "Inicio", href: "/" },
    { label: "Perfiles", href: "/profile" },
    { label: "Cargando...", href: "#" },
  ];

  return (
    <main className="flex min-h-screen flex-col items-start main-style gap-4 md:gap-6 xl:gap-8">
      <BreadcrumbsAdmin items={breadcrumbsItems} />
      <div className="items-start flex gap-4 justify-between w-full max-md:flex-wrap">
        <Skeleton className="rounded-lg">
          <div className="h-40 w-full max-w-md"></div>
        </Skeleton>
        <Skeleton className="rounded-lg">
          <div className="h-40 w-full max-w-md"></div>
        </Skeleton>
      </div>
      <Skeleton className="rounded-lg">
        <div className="h-20 w-full"></div>
      </Skeleton>
      <Skeleton className="rounded-lg">
        <div className="h-96 w-full"></div>
      </Skeleton>
    </main>
  );
}
