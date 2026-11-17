import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import { FaGift } from "react-icons/fa6";

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
    .sort((a, b) => a.price - b.price)
    .map((plan) => ({
      mpPreapprovalPlanId: plan.mpPreapprovalPlanId,
      reason: plan.reason,
      description: plan.description,
      price: plan.price,
      postsLibresCount: plan.postsLibresCount ?? 0,
      postsAgendaCount: plan.postsAgendaCount ?? 0,
      aiTokensPerMonth: plan.aiTokensPerMonth,
      storageBytesLimit: plan.storageBytesLimit,
    }));

  return (
    <main className="flex min-h-screen flex-col items-start main-style gap-3">
      <BreadcrumbsAdmin
        items={[
          { label: "Inicio", href: "/" },
          { label: "Suscripciones", href: SUBSCRIPTIONS },
          { label: "Regalar un plan", href: GIFT_PLAN },
        ]}
      />
      <section className="w-full max-w-5xl mx-auto flex flex-col gap-5">
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between gap-3">
            <h1 className="text-2xl md:text-3xl font-semibold">
              Regalá un <span className="text-primary">plan</span>
            </h1>
            <Link
              href={MY_PLAN_GIFTS}
              className="flex shrink-0 items-center gap-2 rounded-full border border-default-300 bg-white px-3 py-1.5 text-xs font-medium text-text-color transition hover:border-primary hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary sm:px-4 sm:py-2 sm:text-sm"
            >
              <FaGift className="text-primary" />
              Mis regalos
            </Link>
          </div>
          <p className="text-sm md:text-base text-light-text max-w-xl">
            Regalale meses de un plan de Soon a quien quieras. Pagás una sola vez y la
            persona lo activa cuando quiera.
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
