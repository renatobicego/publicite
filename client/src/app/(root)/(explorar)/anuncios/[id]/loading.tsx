import BreadcrumbsAdmin from "@/components/BreadcrumbsAdmin";
import { Skeleton } from "@nextui-org/react";

export default function Loading() {
  const breadcrumbsItems = [
    { label: "Inicio", href: "/" },
    { label: "Anuncios", href: "/posts" },
    { label: "Cargando...", href: "#" },
  ];

  return (
    <main className="flex min-h-screen flex-col items-start main-style gap-6 md:gap-8">
      <BreadcrumbsAdmin items={breadcrumbsItems} />
      <section className="w-full flex max-lg:flex-col gap-4 lg:gap-6 3xl:gap-8 relative">
        <Skeleton className="rounded-lg">
          <div className="h-96 w-full lg:w-2/3"></div>
        </Skeleton>
        <Skeleton className="rounded-lg">
          <div className="h-96 w-full lg:w-1/3"></div>
        </Skeleton>
      </section>
      <section className="w-full flex max-lg:flex-col gap-4 lg:gap-6 3xl:gap-8 md:mt-6 xl:mt-8">
        <Skeleton className="rounded-lg">
          <div className="h-64 w-full lg:w-2/3"></div>
        </Skeleton>
        <Skeleton className="rounded-lg">
          <div className="h-64 w-full lg:w-1/3"></div>
        </Skeleton>
      </section>
    </main>
  );
}
