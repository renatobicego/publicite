import BreadcrumbsAdmin from "@/components/BreadcrumbsAdmin";
import { GIFT_PLAN, MY_PLAN_GIFTS, SUBSCRIPTIONS } from "@/utils/data/urls";
import MyGifts from "./MyGifts";

export const metadata = {
  title: "Mis regalos - Publicité",
  description: "Los planes que regalaste y los que te regalaron.",
};

export default function MyGiftsPage() {
  return (
    <main className="flex min-h-screen flex-col items-start main-style gap-8">
      <BreadcrumbsAdmin
        items={[
          { label: "Inicio", href: "/" },
          { label: "Suscripciones", href: SUBSCRIPTIONS },
          { label: "Regalar un plan", href: GIFT_PLAN },
          { label: "Mis regalos", href: MY_PLAN_GIFTS },
        ]}
      />
      <section className="w-full max-w-2xl mx-auto flex flex-col gap-6">
        <h1 className="text-3xl md:text-4xl font-semibold">Mis regalos</h1>
        <MyGifts />
      </section>
    </main>
  );
}
