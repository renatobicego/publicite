import BreadcrumbsAdmin from "@/components/BreadcrumbsAdmin";
import { PACKS } from "@/utils/data/urls";
import SubscriptionGrid from "../components/SubscriptionGrid";
import ActivePostsCounter from "./ActivePostsCounter";
import { Subscription, SubscriptionPlan } from "@/types/subscriptions";
import {
  getSubscriptionsOfUser,
  getSubscriptionsPlans,
} from "@/services/subscriptionServices";
import { auth } from "@clerk/nextjs/server";

//add metadata
export const metadata = {
  title: "Packs - Publicité",
  description:
    "Packs de anuncios, tokens de IA y almacenamiento que se suman a tu plan en Publicité.",
};

export default async function PostPacks() {
  const breadcrumbsItems = [
    {
      label: "Inicio",
      href: "/",
    },
    {
      label: "Packs",
      href: PACKS,
    },
  ];

  const { sessionClaims } = await auth();
  const subscriptions: SubscriptionPlan[] = await getSubscriptionsPlans();
  // Para marcar los packs que el usuario ya tiene (uno de cada uno).
  const subscriptionsOfUser = await getSubscriptionsOfUser(
    sessionClaims?.metadata.mongoId as string
  );
  const packsOfUser: Subscription[] =
    "error" in subscriptionsOfUser
      ? []
      : subscriptionsOfUser.filter(
          (subscription) => subscription.subscriptionPlan?.isPack
        );

  return (
    <main className="flex min-h-screen flex-col items-start main-style gap-8">
      <BreadcrumbsAdmin items={breadcrumbsItems} />
      <section className="w-full flex flex-col gap-4 md:gap-6 3xl:gap-8 items-center">
        <div className="flex flex-col gap-3 xl:gap-4 items-center">
          <h1 className="text-3xl md:text-[2.5rem] xl:text-5xl font-semibold">
            Packs
          </h1>
          <p className="md:w-2/3 3xl:w-1/2 text-center text-sm md:text-base">
            Sumale a tu plan más anuncios activos, más tokens de IA para Cubito
            y el Tablero de trabajo, o más almacenamiento para tus blogs y las
            fotos de tus anuncios. Cada pack se suma mientras esté activo.
          </p>
          <ActivePostsCounter />
        </div>
        <SubscriptionGrid
          type="packs"
          subscriptions={subscriptions.filter((plan) => plan.isPack)}
          subscriptionsOfUser={packsOfUser}
        />
      </section>
    </main>
  );
}
