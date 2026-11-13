import { auth } from "@clerk/nextjs/server";
import { Link } from "@nextui-org/react";

import BreadcrumbsAdmin from "@/components/BreadcrumbsAdmin";
import { getSubscriptionsPlans } from "@/services/subscriptionServices";
import { SubscriptionPlan } from "@/types/subscriptions";
import { GIFT_PLAN, MY_PLAN_GIFTS, SUBSCRIPTIONS } from "@/utils/data/urls";
import GiftPlanFormLoader from "./GiftPlanFormLoader";
import type { GiftablePlan } from "./GiftPlanForm";

export const metadata = {
  title: "Regalar un plan - Publicité",
  description: "Regalale meses de un plan de Soon a quien quieras.",
};

// Se regalan planes pagos mensuales (no packs): el precio del regalo es por mes.
const isGiftable = (plan: SubscriptionPlan) =>
  plan.isActive && !plan.isFree && !plan.isPack && plan.intervalTime === 30;

export default async function GiftPlanPage() {
  const { sessionClaims } = await auth();
  const plans: GiftablePlan[] = (await getSubscriptionsPlans().catch(() => []))
    .filter(isGiftable)
    .map((plan) => ({
      mpPreapprovalPlanId: plan.mpPreapprovalPlanId,
      reason: plan.reason,
      description: plan.description,
    }));

  return (
    <main className="flex min-h-screen flex-col items-start main-style gap-8">
      <BreadcrumbsAdmin
        items={[
          { label: "Inicio", href: "/" },
          { label: "Suscripciones", href: SUBSCRIPTIONS },
          { label: "Regalar un plan", href: GIFT_PLAN },
        ]}
      />
      <section className="w-full max-w-2xl mx-auto flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl md:text-4xl font-semibold">Regalá un plan</h1>
          <p className="text-sm md:text-base">
            Regalale a alguien meses de un plan de Soon. Pagás una sola vez y la
            persona lo activa cuando quiera.{" "}
            <Link href={MY_PLAN_GIFTS} size="sm">
              Ver mis regalos
            </Link>
          </p>
        </div>
        <GiftPlanFormLoader
          plans={plans}
          myUserId={(sessionClaims?.metadata.mongoId as string) ?? ""}
        />
      </section>
    </main>
  );
}
