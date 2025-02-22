import BreadcrumbsAdmin from "@/components/BreadcrumbsAdmin";
import { PACKS } from "@/utils/data/urls";
import SubscriptionGrid from "../components/SubscriptionGrid";
import ActivePostsCounter from "./ActivePostsCounter";
import { SubscriptionPlan } from "@/types/subscriptions";
import {
  getSubscriptionsOfUser,
  getSubscriptionsPlans,
} from "@/services/subscriptionServices";
import ErrorCard from "@/components/ErrorCard";
import { auth } from "@clerk/nextjs/server";

export default async function PostPacks() {
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

  const subscriptions: SubscriptionPlan[] | { error: string } =
    await getSubscriptionsPlans();

  if ("error" in subscriptions) {
    return <ErrorCard message={"Error obteniendo planes de suscripción"} />;
  }
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
          <ActivePostsCounter />
        </div>
        <SubscriptionGrid
          type="packs"
          subscriptions={subscriptions.filter((plan) => plan.isPack)}
          subscriptionsOfUser={[]}
        />
      </section>
    </main>
  );
}
