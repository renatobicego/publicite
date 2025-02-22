import BreadcrumbsAdmin from "@/components/BreadcrumbsAdmin";
import { SUBSCRIPTIONS } from "@/utils/data/urls";
import Users from "./Users";

import SubscriptionGrid from "../components/SubscriptionGrid";
import {
  getSubscriptionsOfUser,
  getSubscriptionsPlans,
} from "@/services/subscriptionServices";
import { auth } from "@clerk/nextjs/server";
import ErrorCard from "@/components/ErrorCard";
import { SubscriptionPlan } from "@/types/subscriptions";

export default async function SubscriptionPlans() {
  const breadcrumbsItems = [
    {
      label: "Inicio",
      href: "/",
    },
    {
      label: "Suscripciones",
      href: SUBSCRIPTIONS,
    },
  ];
  const { userId } = auth();

  const subscriptions: SubscriptionPlan[] | { error: string } =
    await getSubscriptionsPlans();
  const susbcriptionsOfUser = await getSubscriptionsOfUser(userId as string);

  if ("error" in susbcriptionsOfUser || "error" in subscriptions) {
    return <ErrorCard message={"Error obteniendo planes de suscripción"} />;
  }

  return (
    <main className="flex min-h-screen flex-col items-start main-style gap-8">
      <BreadcrumbsAdmin items={breadcrumbsItems} />
      <section className="w-full flex flex-col gap-4 md:gap-6 3xl:gap-8 items-center">
        <div className="flex flex-col gap-3 xl:gap-4 items-center">
          <h1 className="text-3xl md:text-[2.5rem] xl:text-5xl font-semibold">
            Planes de Suscripción
          </h1>
          <p className="md:w-2/3 text-center text-sm md:text-base">
            Nuestros planes de subscripción están pensados para ser accesibles y
            enfocados en tus necesidades.{" "}
          </p>
          {/* <Users /> */}
        </div>
        <SubscriptionGrid
          type="suscripciones"
          subscriptions={subscriptions.filter((plan) => !plan.isPack)}
          subscriptionsOfUser={susbcriptionsOfUser.filter(
            (subscription) => !subscription.subscriptionPlan.isPack
          )}
        />
      </section>
    </main>
  );
}
