import BreadcrumbsAdmin from "@/app/components/BreadcrumbsAdmin";
import { PACKS } from "@/app/utils/urls";
import SubscriptionGrid from "../components/SubscriptionGrid";

export default function Page() {
  const breadcrumbsItems = [
    {
      label: "Inicio",
      href: "/",
    },
    {
      label: "Packs de Publicaciones",
      href: PACKS,
    },
  ];

  return (
    <main className="flex min-h-screen flex-col items-start main-style gap-8">
      <BreadcrumbsAdmin items={breadcrumbsItems} />
      <section className="w-full flex flex-col gap-4 md:gap-6 3xl:gap-8 items-center">
        <div className="flex flex-col gap-3 xl:gap-4 items-center">
          <h1 className="text-3xl md:text-[2.5rem] xl:text-5xl font-semibold">
            Packs de Publicaciones
          </h1>
          <p className="md:w-2/3 3xl:w-1/2 text-center text-sm md:text-base">
            Nuestros packs de publicaciones te permiten aumentar tu límite de
            anuncios activos, ofreciendo mayor disponibilidad de productos o
            servicios a tus clientes.
          </p>
          <p className="text-tiny md:text-small text-light-text">
            Estás utilizando 40 de tus 50 publicaciones activas disponibles.
          </p>
        </div>
        <SubscriptionGrid type="packs"/>
      </section>
    </main>
  );
}
