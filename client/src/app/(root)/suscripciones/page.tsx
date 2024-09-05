import BreadcrumbsAdmin from "@/app/components/BreadcrumbsAdmin";
import { SUBSCRIPTIONS } from "@/app/utils/urls";
import Users from "./Users";
import { mockedSubscriptionPlans } from "@/app/utils/mockedData";
import SubscriptionPlanCard from "./SubscriptionPlanCard";

export default function Page() {
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

  return (
    <main className="flex min-h-screen flex-col items-start main-style gap-8">
      <BreadcrumbsAdmin items={breadcrumbsItems} />
      <section className="w-full flex flex-col gap-8 items-center">
        <div className="flex flex-col gap-4 items-center">
          <h1 className="text-5xl font-semibold">Planes de Suscripción</h1>
          <p className="w-2/3 text-center">
            Nuestros planes de subscripción están pensados para ser accesibles y
            enfocados en tus necesidades.{" "}
          </p>
          <Users />
        </div>
        <div className="grid grid-cols-3 w-3/4 gap-4">
          {mockedSubscriptionPlans.map((plan) => (
            <SubscriptionPlanCard
              key={plan._id}
              subscriptionPlan={plan}
              isPopular={plan.reason === "Publicité Premium"}
            />
          ))}
        </div>
      </section>
    </main>
  );
}
